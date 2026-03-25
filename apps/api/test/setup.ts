import { beforeAll, afterAll, vi } from 'vitest';

// Mock Prisma Client for testing
const mockPrisma = {
  $connect: vi.fn().mockResolvedValue(undefined),
  $disconnect: vi.fn().mockResolvedValue(undefined),
  $on: vi.fn(),
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
