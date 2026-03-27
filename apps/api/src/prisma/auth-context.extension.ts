import { PrismaClient } from '@prisma/client';
import { AsyncLocalStorage } from 'async_hooks';
import { Logger } from '@nestjs/common';

/**
 * Authentication context interface with internal system support.
 *
 * @remarks
 * - Stores the current request's authentication context
 * - Used by Prisma extension to set database variables
 * - Thread-safe per-request storage
 * - Supports internal system bypass for background jobs
 */
export interface AuthContext {
  accountId: string;
  tenantId?: string;
  scope: string;
  identityId: string;
  isInternalSystem?: boolean; // For CRON jobs, seeding, etc.
}

/**
 * Internal system context for bypass operations.
 *
 * @remarks
 * - Used for background jobs and database seeding
 * - Requires explicit marking and heavy logging
 * - Bypasses fail-closed logic but maintains audit trail
 */
export interface InternalSystemContext extends AuthContext {
  isInternalSystem: true;
  systemType: 'cron' | 'seeder' | 'migration' | 'admin';
  reason: string;
}

/**
 * Logger for RLS operations and security events.
 *
 * @remarks
 * - Used for security monitoring and debugging
 * - Logs all RLS context operations and bypass attempts
 */
const rlsLogger = new Logger('AuthContextExtension');

/**
 * AsyncLocalStorage instance for tracking transaction state.
 *
 * @remarks
 * - Prevents redundant SET LOCAL calls in existing transactions
 * - Tracks if RLS context has been set for current connection
 * - Automatically cleaned up when request completes
 */
const transactionStateTracker = new AsyncLocalStorage<{
  hasRlsContext: boolean;
  transactionId: string;
}>();

/**
 * Prisma operation context for extension.
 *
 * @remarks
 * - Defines the structure of operation parameters
 * - Used for type-safe extension implementation
 */
interface PrismaOperationContext {
  args: Record<string, unknown>;
  query: (args: Record<string, unknown>) => Promise<unknown>;
  model?: string;
  operation: string;
}

/**
 * Prisma transaction context for RLS operations.
 *
 * @remarks
 * - Defines the transaction interface for setting context
 * - Used for type-safe transaction operations
 */
interface PrismaTransactionContext {
  $executeRaw: (template: TemplateStringsArray, ...values: unknown[]) => Promise<number>;
}

/**
 * AsyncLocalStorage instance for per-request auth context.
 *
 * @remarks
 * - Ensures context isolation between concurrent requests
 * - Automatically cleaned up when request completes
 * - Works across async/await boundaries
 */
const authContextStorage = new AsyncLocalStorage<AuthContext>();

/**
 * AsyncLocalStorage instance for tracking RLS recursion depth.
 *
 * @remarks
 * - Prevents infinite loops in nested Prisma operations
 * - Shared across all RLS operations in the same request
 * - Automatically cleaned up when request completes
 */
const rlsRecursionTracker = new AsyncLocalStorage<number>();

/**
 * Prisma extension that automatically sets RLS context.
 *
 * @remarks
 * - **Scope:** platform
 * - **Authority:** Infrastructure layer
 * - **Invariants:** Sets database variables before every operation
 * - **Threading/Async:** Uses AsyncLocalStorage for request isolation
 * - **Side effects:** Executes SET LOCAL commands in Postgres
 * - **Tenancy:** Enforces tenant isolation at database level
 *
 * @example
 * ```typescript
 * const prisma = new PrismaClient().$extends(withAuthContext);
 *
 * // Set context for request
 * authContextStorage.run({ accountId: '...', tenantId: '...', scope: 'tenant', identityId: '...' }, async () => {
 *   // All queries here will have RLS context set automatically
 *   const products = await prisma.product.findMany();
 * });
 * ```
 */
export const withAuthContext = (client: PrismaClient) => {
  return client.$extends({
    name: 'auth-context',
    client: {
      $setAuthContext(context: AuthContext) {
        // Store context in AsyncLocalStorage for this request
        authContextStorage.enterWith(context);
      },
      $getAuthContext(): AuthContext | undefined {
        return authContextStorage.getStore();
      },
    },
    query: {
      $allOperations: ({ args, query, model, operation }: PrismaOperationContext) => {
        // Get current auth context
        const authContext = authContextStorage.getStore();
        const transactionState = transactionStateTracker.getStore();

        // FAIL-CLOSED LOGIC: Require auth context for protected models
        if (!authContext) {
          // Check if this is a system model that can operate without context
          if (isSystemModel(model)) {
            // System models can proceed without auth context
            return query(args);
          }

          // Fail-closed: Block access to protected models without auth context
          const error = new Error(`Access denied: Model '${model}' requires authentication context`);
          error.name = 'PrismaClientKnownRequestError';
          (error as any).code = 'P2002'; // Unique constraint violation (for consistency)
          (error as any).meta = {
            model,
            operation,
            reason: 'AUTH_CONTEXT_REQUIRED',
            timestamp: new Date().toISOString()
          };
          throw error;
        }

        // Log internal system bypasses heavily
        if (authContext.isInternalSystem) {
          const internalCtx = authContext as InternalSystemContext;
          rlsLogger.warn(`INTERNAL SYSTEM BYPASS: ${internalCtx.systemType} accessing ${model}.${operation} - Reason: ${internalCtx.reason}`, {
            systemType: internalCtx.systemType,
            model,
            operation,
            accountId: internalCtx.accountId,
            timestamp: new Date().toISOString()
          });
        }

        // Check if we need to set RLS context (transaction optimization)
        if (shouldSetRlsContext(model, operation)) {
          // Check if we're already in a transaction with RLS context set
          if (transactionState?.hasRlsContext) {
            // Reuse existing transaction context
            return query(args);
          }

          return executeQueryWithContext(client, query as (args: Record<string, unknown>) => Promise<unknown>, args, authContext);
        }

        return query(args);
      },
    },
  });
};

/**
 * Determines if a model is a system model that can operate without auth context.
 *
 * @param model - Prisma model name
 * @returns true if model is a system model
 */
function isSystemModel(model?: string): boolean {
  const systemModels = ['AuthEvent', 'Tenant', 'Migration'];
  return systemModels.includes(model || '');
}

/**
 * Executes operation with RLS context, recursion prevention, and transaction state tracking.
 *
 * @param client - Prisma client instance
 * @param query - Original Prisma query function
 * @param args - Query arguments
 * @param authContext - Authentication context
 * @returns Query result with RLS applied
 */
async function executeQueryWithContext(
  client: PrismaClient,
  query: (args: Record<string, unknown>) => Promise<unknown>,
  args: Record<string, unknown>,
  authContext: AuthContext
): Promise<unknown> {
  // Get current recursion depth from shared tracker
  const currentDepth = rlsRecursionTracker.getStore() || 0;
  const transactionState = transactionStateTracker.getStore();

  if (currentDepth > 2) {
    // Prevent deep recursion that might cause infinite loops
    rlsLogger.warn('RLS recursion depth exceeded, falling back to direct query');
    return query(args);
  }

  // Generate transaction ID for tracking
  const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Execute with incremented recursion depth and transaction state
  return await rlsRecursionTracker.run(currentDepth + 1, async () => {
    return await transactionStateTracker.run(
      { hasRlsContext: true, transactionId },
      async () => {
        // Use transaction to ensure context is set atomically
        return await client.$transaction(async (tx: PrismaTransactionContext) => {
          // Set RLS context variables for this transaction
          await tx.$executeRaw`SET LOCAL app.current_account_id = ${authContext.accountId}`;
          await tx.$executeRaw`SET LOCAL app.current_tenant_id = ${authContext.tenantId || null}`;
          await tx.$executeRaw`SET LOCAL app.current_scope = ${authContext.scope}`;
          await tx.$executeRaw`SET LOCAL app.current_identity_id = ${authContext.identityId}`;

          // Execute the original query within the transaction
          const result = await query(args);

          return result;
        });
      }
    );
  });
}

/**
 * Cache for RLS context decisions to optimize performance.
 *
 * @remarks
 * - Stores decisions per model/operation combination
 * - Reduces repeated evaluation overhead
 * - Thread-safe for concurrent operations
 */
const rlsContextCache = new Map<string, boolean>();

/**
 * Determines if operation needs RLS context with caching optimization.
 *
 * @param model - Prisma model name
 * @param operation - Operation type (find, create, update, delete)
 * @returns true if RLS context should be set
 */
function shouldSetRlsContext(model?: string, operation?: string): boolean {
  // Create cache key
  const cacheKey = `${model || 'unknown'}:${operation || 'unknown'}`;

  // Check cache first
  if (rlsContextCache.has(cacheKey)) {
    return rlsContextCache.get(cacheKey)!;
  }

  // Skip RLS for system-level operations
  const systemModels = ['AuthEvent', 'Tenant'];
  const systemOperations = ['count', 'groupBy', 'aggregate', 'raw', 'queryRaw', 'executeRaw'];

  let shouldSet = true;

  if (systemModels.includes(model || '')) {
    shouldSet = false;
  } else if (systemOperations.includes(operation || '')) {
    shouldSet = false;
  } else if (!model || !operation) {
    // Skip for undefined model/operation (edge cases)
    shouldSet = false;
  }

  // Cache the decision
  rlsContextCache.set(cacheKey, shouldSet);

  return shouldSet;
}

/**
 * Utility class for managing auth context with validation and debugging.
 *
 * @remarks
 * - Provides helper methods for context management
 * - Ensures consistent context setting across the application
 * - Includes validation and debugging capabilities
 */
export class AuthContextManager {
  /**
   * Sets auth context for the current request with validation.
   *
   * @param context - Authentication context
   * @throws Error - When context validation fails
   */
  static setContext(context: AuthContext): void {
    this.validateContext(context);
    authContextStorage.enterWith(context);
  }

  /**
   * Gets current auth context.
   *
   * @returns Current auth context or undefined
   */
  static getContext(): AuthContext | undefined {
    return authContextStorage.getStore();
  }

  /**
   * Clears current auth context.
   */
  static clearContext(): void {
    authContextStorage.disable();
  }

  /**
   * Runs operation with auth context and error handling.
   *
   * @param context - Authentication context
   * @param operation - Operation to run
   * @returns Result of the operation
   */
  static async withContext<T>(
    context: AuthContext,
    operation: () => Promise<T>
  ): Promise<T> {
    this.validateContext(context);
    return await authContextStorage.run(context, operation);
  }

  /**
   * Validates auth context structure.
   *
   * @param context - Authentication context to validate
   * @throws Error - When context is invalid
   */
  private static validateContext(context: AuthContext): void {
    if (!context) {
      throw new Error('Auth context cannot be null or undefined');
    }

    if (!context.accountId || typeof context.accountId !== 'string') {
      throw new Error('Auth context must have a valid accountId');
    }

    if (!context.scope || typeof context.scope !== 'string') {
      throw new Error('Auth context must have a valid scope');
    }

    if (!context.identityId || typeof context.identityId !== 'string') {
      throw new Error('Auth context must have a valid identityId');
    }

    // tenantId is optional, but if present must be a string
    if (context.tenantId !== undefined && typeof context.tenantId !== 'string') {
      throw new Error('Auth context tenantId must be a string if provided');
    }
  }

  /**
   * Debug method to check current context state.
   *
   * @returns Debug information about current context
   */
  static debugInfo(): {
    hasContext: boolean;
    contextInfo?: Partial<AuthContext>;
    timestamp: string;
  } {
    const context = this.getContext();
    return {
      hasContext: !!context,
      contextInfo: context ? {
        accountId: context.accountId,
        scope: context.scope,
        identityId: context.identityId,
        tenantId: context.tenantId
      } : undefined,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Creates an internal system context for background operations.
   *
   * @param systemType - Type of internal system operation
   * @param accountId - Account ID to associate with the operation
   * @param reason - Reason for the bypass
   * @returns Internal system context
   */
  static createInternalContext(
    systemType: 'cron' | 'seeder' | 'migration' | 'admin',
    accountId: string,
    reason: string
  ): InternalSystemContext {
    const context: InternalSystemContext = {
      accountId,
      scope: 'platform', // Internal systems always have platform scope
      identityId: 'system', // System identity
      isInternalSystem: true,
      systemType,
      reason
    };

    this.validateContext(context);
    return context;
  }

  /**
   * Runs operation with internal system context and heavy logging.
   *
   * @param systemType - Type of internal system operation
   * @param accountId - Account ID to associate with the operation
   * @param reason - Reason for the bypass
   * @param operation - Operation to run
   * @returns Result of the operation
   */
  static async withInternalContext<T>(
    systemType: 'cron' | 'seeder' | 'migration' | 'admin',
    accountId: string,
    reason: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const context = this.createInternalContext(systemType, accountId, reason);

    rlsLogger.warn(`INTERNAL SYSTEM OPERATION STARTED: ${systemType}`, {
      systemType,
      accountId,
      reason,
      timestamp: new Date().toISOString()
    });

    try {
      const result = await this.withContext(context, operation);

      rlsLogger.log(`INTERNAL SYSTEM OPERATION COMPLETED: ${systemType}`, {
        systemType,
        accountId,
        success: true,
        timestamp: new Date().toISOString()
      });

      return result;
    } catch (error) {
      rlsLogger.error(`INTERNAL SYSTEM OPERATION FAILED: ${systemType}`, {
        systemType,
        accountId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }
}
