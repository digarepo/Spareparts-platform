import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { withAuthContext, AuthContextManager } from '../../src/prisma/auth-context.extension';

describe('Fail-Closed RLS Validation', () => {
  let prisma: any;
  let mockPrisma: any;

  beforeEach(() => {
    // Get the mocked Prisma instance from the global setup
    mockPrisma = (globalThis as any).prisma;

    // Extend the mock with additional models needed for these tests
    Object.assign(mockPrisma, {
      identity: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      account: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      session: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      authEvent: {
        findMany: vi.fn(),
        create: vi.fn(),
      },
      tenant: {
        findMany: vi.fn(),
        create: vi.fn(),
      },
      $transaction: vi.fn(),
      $executeRaw: vi.fn(),
    });

    // Apply the withAuthContext extension directly to the mock
    prisma = withAuthContext(mockPrisma);
  });

  afterEach(() => {
    // Ensure no context leaks between tests
    AuthContextManager.clearContext();
    vi.clearAllMocks();
  });

  /**
   * Scenario Description: Tests that protected models cannot be accessed without an active AuthContext.
   * This validates the fail-closed security invariant where missing authentication context results in
   * immediate access denial rather than silent bypass.
   */
  it('should block access to protected models without AuthContext', async () => {
    // Arrange: No auth context set
    AuthContextManager.clearContext();

    // Act & Assert: Account model should fail
    try {
      await prisma.account.findMany();
      // If we get here, the test should fail
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.message).toBe('Access denied: Model \'account\' requires authentication context');
      expect(error.name).toBe('PrismaClientKnownRequestError');
      expect(error.code).toBe('P2002');
      expect(error.meta.reason).toBe('AUTH_CONTEXT_REQUIRED');
      expect(error.meta.model).toBe('account');
      expect(error.meta.timestamp).toBeDefined();
    }

    // Act & Assert: Identity model should fail
    try {
      await prisma.identity.findMany();
      // If we get here, the test should fail
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.message).toBe('Access denied: Model \'identity\' requires authentication context');
    }
  });

  /**
   * Scenario Description: Tests that system models can still operate without AuthContext.
   * This validates that the fail-closed logic properly distinguishes between protected
   * and system-level models.
   */
  it('should allow access to system models without AuthContext', async () => {
    // Arrange: No auth context set
    AuthContextManager.clearContext();

    // Mock system model operations to succeed
    mockPrisma.authEvent.findMany.mockResolvedValue([]);
    mockPrisma.tenant.findMany.mockResolvedValue([]);

    // Act & Assert: System models should succeed (they're in the excludeModels list)
    const authEvents = await prisma.authEvent.findMany();
    expect(authEvents).toEqual([]);

    const tenants = await prisma.tenant.findMany();
    expect(tenants).toEqual([]);

    // Verify system models were not blocked by fail-closed logic
    expect(mockPrisma.authEvent.findMany).toHaveBeenCalled();
    expect(mockPrisma.tenant.findMany).toHaveBeenCalled();
  });

  /**
   * Scenario Description: Tests that protected models work correctly with valid AuthContext.
   * This ensures the fail-closed mechanism doesn't block legitimate authenticated access.
   */
  it('should allow access to protected models with valid AuthContext', async () => {
    // Arrange: Set valid auth context
    const authContext = {
      accountId: 'acct_123',
      identityId: 'ident_123',
      scope: 'tenant',
      tenantId: 'tenant_123'
    };

    AuthContextManager.setContext(authContext);

    // Mock successful operations
    mockPrisma.$transaction.mockImplementation(async (callback: any) => {
      return callback(mockPrisma);
    });
    mockPrisma.account.findMany.mockResolvedValue([{ id: 'acct_123' }]);

    // Act: Access protected model with context
    const accounts = await prisma.account.findMany();

    // Assert: Should succeed
    expect(accounts).toEqual([{ id: 'acct_123' }]);
    expect(mockPrisma.$executeRaw).toHaveBeenCalledWith(
      expect.any(Object), // SQL template
      authContext.accountId
    );
  });

  /**
   * Scenario Description: Tests that invalid AuthContext is rejected.
   * This validates that malformed or incomplete context is treated as no context.
   */
  it('should reject requests with invalid AuthContext', async () => {
    // Arrange: Set invalid auth context (missing required fields)
    const invalidContext = {
      accountId: '', // Empty string
      scope: 'tenant',
      identityId: 'ident_123'
    };

    // Act & Assert: Should throw validation error
    expect(() => AuthContextManager.setContext(invalidContext as any))
      .toThrow('Auth context must have a valid accountId');
  });
});
