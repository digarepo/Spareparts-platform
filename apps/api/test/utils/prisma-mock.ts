import { vi } from 'vitest';
import type { PrismaClient } from '@prisma/client';

/**
 * Enhanced Prisma mock that properly simulates auth-context extension behavior
 */
export function createMockPrisma() {
  const mockPrisma = {
    // Core Prisma methods
    $connect: vi.fn().mockResolvedValue(undefined),
    $disconnect: vi.fn().mockResolvedValue(undefined),
    $on: vi.fn(),
    $transaction: vi.fn(),
    $executeRaw: vi.fn(),
    $queryRaw: vi.fn(),
    
    // AuthContext extension methods
    $setAuthContext: vi.fn(),
    $getAuthContext: vi.fn(),
    
    // $extends method that properly simulates the auth-context extension
    $extends: vi.fn().mockImplementation((extension) => {
      const extendedClient = { ...mockPrisma };
      
      // Store the extension for later use
      (extendedClient as any)._authExtension = extension;
      
      // Wrap model operations with auth context checks
      const wrapOperation = (modelName: string, operationName: string, originalFn: any) => {
        return vi.fn().mockImplementation(async (...args) => {
          // Simulate the auth context check from auth-context.extension.ts
          const authContext = getCurrentAuthContext();
          
          // Check if this is a system model that can operate without context
          const isSystemModel = (model: string) => 
            ['AuthEvent', 'Tenant', 'Migration'].includes(model);
          
          // Fail-closed logic: require auth context for protected models
          if (!authContext && !isSystemModel(modelName)) {
            const error = new Error(`Access denied: Model '${modelName}' requires authentication context`);
            error.name = 'PrismaClientKnownRequestError';
            (error as any).code = 'P2002';
            (error as any).meta = {
              model: modelName,
              operation: operationName,
              reason: 'AUTH_CONTEXT_REQUIRED',
              timestamp: new Date().toISOString()
            };
            throw error;
          }
          
          // Log internal system bypasses
          if (authContext?.isInternalSystem) {
            console.warn(`INTERNAL SYSTEM BYPASS: ${(authContext as any).systemType} accessing ${modelName}.${operationName}`);
          }
          
          // Execute the original operation
          return originalFn(...args);
        });
      };
      
      // Wrap all model operations
      Object.keys(mockPrisma).forEach(modelName => {
        if (typeof mockPrisma[modelName] === 'object' && 
            !modelName.startsWith('$') && 
            modelName !== '_authExtension') {
          const model = mockPrisma[modelName];
          extendedClient[modelName] = {};
          
          Object.keys(model).forEach(operationName => {
            if (typeof model[operationName] === 'function') {
              extendedClient[modelName][operationName] = wrapOperation(
                modelName, 
                operationName, 
                model[operationName]
              );
            }
          });
        }
      });
      
      return extendedClient;
    }),
    
    // Model definitions - these will be extended in tests
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
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    tenantMembership: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    product: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    variant: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    order: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    accountRole: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  };
  
  return mockPrisma;
}

/**
 * Mock AsyncLocalStorage for auth context
 */
class MockAsyncLocalStorage<T> {
  private store: T | undefined;
  
  getStore(): T | undefined {
    return this.store;
  }
  
  run<R>(store: T, callback: (...args: any[]) => R): R {
    const previousStore = this.store;
    this.store = store;
    try {
      return callback();
    } finally {
      this.store = previousStore;
    }
  }
}

// Global auth context storage
export const mockAuthContextStorage = new MockAsyncLocalStorage<any>();

/**
 * Get current auth context from mock storage
 */
function getCurrentAuthContext() {
  return mockAuthContextStorage.getStore();
}

/**
 * Factory function to create PrismaClient instances
 */
export const createPrismaClient = () => {
  const mock = createMockPrisma();
  return mock as any as PrismaClient;
};

/**
 * Mock PrismaService for dependency injection
 */
export const createMockPrismaService = () => ({
  db: createMockPrisma(),
  $connect: vi.fn().mockResolvedValue(undefined),
  $disconnect: vi.fn().mockResolvedValue(undefined),
  setAuthContext: vi.fn(),
  getAuthContext: vi.fn(),
});
