import { beforeAll, afterAll, vi } from 'vitest';

// Mock Prisma Client for testing
const mockPrisma = {
  $connect: vi.fn().mockResolvedValue(undefined),
  $disconnect: vi.fn().mockResolvedValue(undefined),
  $on: vi.fn(),
  $extends: vi.fn().mockImplementation((extension) => {
    // Return a mock that simulates the extended client with auth context
    const extendedClient = {
      ...mockPrisma,
      $setAuthContext: vi.fn(),
      $getAuthContext: vi.fn(),
    };

    // Mock the query interception for auth context
    if (extension.query && extension.query.$allOperations) {
      const originalOperations = { ...mockPrisma };

      // Wrap each model operation with the auth context check
      Object.keys(originalOperations).forEach(modelName => {
        if (typeof originalOperations[modelName] === 'object' && modelName !== '$connect' && modelName !== '$disconnect') {
          const modelOperations = originalOperations[modelName];
          extendedClient[modelName] = {};

          Object.keys(modelOperations).forEach(operationName => {
            if (typeof modelOperations[operationName] === 'function') {
              extendedClient[modelName][operationName] = vi.fn().mockImplementation((...args) => {
                // Simulate the auth context check
                const authContext = extension.query.$allOperations({
                  model: modelName,
                  operation: operationName,
                  args: args[0] || {},
                  query: () => modelOperations[operationName](...args)
                });

                return authContext;
              });
            }
          });
        }
      });
    }

    return extendedClient;
  }),
  product: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  variant: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  taxonomyNode: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  productTaxonomyAssignment: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    delete: vi.fn(),
  },
};

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => mockPrisma),
}));

beforeAll(async () => {
  // Setup test database
  await mockPrisma.$connect();

  // Mock console methods to avoid noise in tests
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'debug').mockImplementation(() => {});
});

afterAll(async () => {
  // Cleanup test database
  await mockPrisma.$disconnect();
  vi.restoreAllMocks();
});

// Global test utilities with proper typing
declare global {
  var prisma: typeof mockPrisma;
}

(globalThis as { prisma?: typeof mockPrisma }).prisma = mockPrisma;
