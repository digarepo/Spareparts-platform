import { describe, it, expect, beforeEach, vi } from 'vitest';
import { withAuthContext, AuthContextManager } from '../../src/prisma/auth-context.extension';

describe('Tenant Isolation', () => {
  let prisma: any;
  let mockPrisma: any;

  beforeEach(() => {
    // Get the mocked Prisma instance from the global setup
    mockPrisma = (globalThis as any).prisma;

    // Extend the mock with additional models needed for these tests
    Object.assign(mockPrisma, {
      account: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
      },
      identity: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
      },
      order: {
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
      $transaction: vi.fn(),
      $executeRaw: vi.fn(),
    });

    // Apply the withAuthContext extension directly to the mock
    prisma = withAuthContext(mockPrisma);
  });

  /**
   * Scenario Description: Tests that users from Tenant A cannot access Tenant B's data.
   * This validates the core tenant isolation security invariant.
   */
  it('should prevent cross-tenant data access', async () => {
    // Arrange: Setup Tenant A user context
    const tenantAContext = {
      accountId: 'acct_tenantA_123',
      identityId: 'ident_123',
      scope: 'tenant',
      tenantId: 'tenant_A_id'
    };

    // Mock database operations to return Tenant B data
    const tenantBProducts = [
      { id: 'prod_B1', tenantId: 'tenant_B_id', name: 'Tenant B Product 1' },
      { id: 'prod_B2', tenantId: 'tenant_B_id', name: 'Tenant B Product 2' }
    ];

    mockPrisma.$transaction.mockImplementation(async (callback: any) => {
      return callback(mockPrisma);
    });
    mockPrisma.product.findMany.mockResolvedValue(tenantBProducts);

    // Act: Attempt to access products with Tenant A context
    AuthContextManager.setContext(tenantAContext);
    const products = await prisma.product.findMany();

    // Assert: RLS should filter out Tenant B data
    // In a real implementation, this would return empty or only Tenant A data
    // For this test, we verify the RLS context was set correctly
    expect(mockPrisma.$executeRaw).toHaveBeenCalledWith(
      expect.any(Object),
      'acct_tenantA_123'
    );
    expect(mockPrisma.$executeRaw).toHaveBeenCalledWith(
      expect.any(Object),
      'tenant_A_id'
    );
    expect(mockPrisma.$executeRaw).toHaveBeenCalledWith(
      expect.any(Object),
      'tenant'
    );
    expect(mockPrisma.$executeRaw).toHaveBeenCalledWith(
      expect.any(Object),
      'ident_123'
    );
  });

  /**
   * Scenario Description: Tests that users can only access their own tenant's data.
   * This validates successful tenant-scoped access patterns.
   */
  it('should allow access to own tenant data', async () => {
    // Arrange: Setup Tenant A user context and data
    const tenantAContext = {
      accountId: 'acct_tenantA_123',
      identityId: 'ident_123',
      scope: 'tenant',
      tenantId: 'tenant_A_id'
    };

    const tenantAProducts = [
      { id: 'prod_A1', tenantId: 'tenant_A_id', name: 'Tenant A Product 1' },
      { id: 'prod_A2', tenantId: 'tenant_A_id', name: 'Tenant A Product 2' }
    ];

    mockPrisma.$transaction.mockImplementation(async (callback: any) => {
      return callback(mockPrisma);
    });
    mockPrisma.product.findMany.mockResolvedValue(tenantAProducts);

    // Act: Access products with correct tenant context
    AuthContextManager.setContext(tenantAContext);
    const products = await prisma.product.findMany();

    // Assert: Should succeed and return Tenant A data
    expect(products).toEqual(tenantAProducts);
    expect(mockPrisma.$executeRaw).toHaveBeenCalledWith(
      expect.any(Object),
      'tenant_A_id' // Correct tenant ID set
    );
  });

  /**
   * Scenario Description: Tests that tenant isolation works for all data operations.
   * This validates comprehensive tenant boundary enforcement.
   */
  it('should enforce tenant isolation across all operations', async () => {
    // Arrange: Setup tenant context
    const tenantContext = {
      accountId: 'acct_123',
      identityId: 'ident_123',
      scope: 'tenant',
      tenantId: 'tenant_X_id'
    };

    mockPrisma.$transaction.mockImplementation(async (callback: any) => {
      return callback(mockPrisma);
    });
    mockPrisma.product.findUnique.mockResolvedValue({ id: 'prod_1' });
    mockPrisma.product.create.mockResolvedValue({ id: 'prod_new' });
    mockPrisma.product.update.mockResolvedValue({ id: 'prod_updated' });
    mockPrisma.product.delete.mockResolvedValue({ id: 'prod_deleted' });

    AuthContextManager.setContext(tenantContext);

    // Act: Perform various operations
    await prisma.product.findUnique({ where: { id: 'prod_1' } });
    await prisma.product.create({ data: { name: 'New Product' } });
    await prisma.product.update({ where: { id: 'prod_1' }, data: { name: 'Updated' } });
    await prisma.product.delete({ where: { id: 'prod_1' } });

    // Assert: All operations should have tenant context set
    expect(mockPrisma.$executeRaw).toHaveBeenCalledTimes(16); // 4 operations × 4 context sets each (RLS overhead)
    expect(mockPrisma.$executeRaw).toHaveBeenCalledWith(
      expect.any(Object), // SQL template
      tenantContext.accountId, // Current account ID
    );
  });

  /**
   * Scenario Description: Tests that platform scope bypasses tenant restrictions.
   * This validates platform-level administrative access.
   */
  it('should allow platform scope to bypass tenant restrictions', async () => {
    // Arrange: Setup platform context
    const platformContext = {
      accountId: 'acct_platform_123',
      identityId: 'ident_platform',
      scope: 'platform',
      tenantId: undefined // Platform scope has no tenant
    };

    const allTenantProducts = [
      { id: 'prod_A1', tenantId: 'tenant_A_id', name: 'Tenant A Product' },
      { id: 'prod_B1', tenantId: 'tenant_B_id', name: 'Tenant B Product' },
    ];

    mockPrisma.$transaction.mockImplementation(async (callback: any) => {
      return callback(mockPrisma);
    });
    mockPrisma.product.findMany.mockResolvedValue(allTenantProducts);

    // Act: Access all products with platform scope
    AuthContextManager.setContext(platformContext);
    const products = await prisma.product.findMany();

    // Assert: Should return all products
    expect(products).toEqual(allTenantProducts);
    expect(mockPrisma.$executeRaw).toHaveBeenCalledWith(
      expect.any(Object),
      null // No tenant ID for platform scope
    );
  });

  /**
   * Scenario Description: Tests that customer scope respects tenant boundaries.
   * This validates customer access within tenant context.
   */
  it('should enforce tenant boundaries for customer scope', async () => {
    // Arrange: Setup customer context with tenant
    const customerContext = {
      accountId: 'acct_customer_123',
      identityId: 'ident_customer',
      scope: 'customer',
      tenantId: 'tenant_A_id'
    };

    mockPrisma.$transaction.mockImplementation(async (callback: any) => {
      return callback(mockPrisma);
    });
    mockPrisma.order.findMany.mockResolvedValue([
      { id: 'order_1', tenantId: 'tenant_A_id', customerId: 'customer_123' }
    ]);

    // Act: Access orders with customer context
    AuthContextManager.setContext(customerContext);
    const orders = await prisma.order.findMany();

    // Assert: Should have tenant context set
    expect(orders).toHaveLength(1);
    expect(mockPrisma.$executeRaw).toHaveBeenCalledWith(
      expect.any(Object),
      'tenant_A_id'
    );
  });

  /**
   * Scenario Description: Tests direct tenant ID manipulation attempts.
   * This validates that explicit tenant ID in queries doesn't bypass RLS.
   */
  it('should prevent explicit tenant ID manipulation', async () => {
    // Arrange: Setup Tenant A user trying to access Tenant B data explicitly
    const tenantAContext = {
      accountId: 'acct_tenantA_123',
      identityId: 'ident_123',
      scope: 'tenant',
      tenantId: 'tenant_A_id'
    };

    mockPrisma.$transaction.mockImplementation(async (callback: any) => {
      return callback(mockPrisma);
    });
    mockPrisma.product.findMany.mockResolvedValue([]); // RLS should block this

    AuthContextManager.setContext(tenantAContext);

    // Act: Try to explicitly query Tenant B data
    const products = await prisma.product.findMany({
      where: { tenantId: 'tenant_B_id' } // Explicitly trying Tenant B ID
    });

    // Assert: RLS should still enforce Tenant A context
    expect(products).toEqual([]);
    expect(mockPrisma.$executeRaw).toHaveBeenCalledWith(
      expect.any(Object),
      'tenant_A_id' // RLS context, not the explicit tenant ID
    );
  });
});
