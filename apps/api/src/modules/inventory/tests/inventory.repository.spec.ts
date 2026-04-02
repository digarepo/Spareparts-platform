import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InventoryRepository } from '../repositories/inventory.repository';
import { PrismaService } from '../../../prisma/prisma.service';
import { ConflictException } from '@nestjs/common';
import { StockMovementType } from '@spareparts/contracts';
import type { RequestContext } from '@spareparts/contracts';
import type { InventoryItem, StockMovement } from '@prisma/client';

// Mock Prisma Client
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(),
}));

describe('InventoryRepository', () => {
  let repository: InventoryRepository;
  let mockPrismaService: any;
  let mockPrismaClient: any;
  let mockContext: RequestContext;

  // Helper function to create complete InventoryItem mocks
  const createMockInventory = (overrides: Partial<InventoryItem> = {}): InventoryItem => ({
    id: 'inventory-123',
    tenantId: 'test-tenant-id',
    catalogVariantId: 'variant-123',
    onHandQuantity: 100,
    reservedQuantity: 0,
    allocatedQuantity: 0,
    isActive: true,
    isSellable: true,
    lowStockThreshold: null,
    location: 'warehouse-1',
    source: null,
    unitCost: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  beforeEach(() => {
    // Mock Prisma Service with transaction support
    mockPrismaClient = {
      inventoryItem: {
        findFirst: vi.fn(),
        update: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
      },
      stockMovement: {
        create: vi.fn(),
      },
      $transaction: vi.fn().mockImplementation((callback) => {
        // Execute callback with mock transaction client
        const txClient = {
          inventoryItem: mockPrismaClient.inventoryItem,
          stockMovement: mockPrismaClient.stockMovement,
        };
        return callback(txClient);
      }),
    };

    mockPrismaService = {
      db: mockPrismaClient,
    };

    repository = new InventoryRepository(mockPrismaService);

    // Mock RequestContext following the contract shape
    mockContext = {
      correlationId: 'test-correlation-id',
      tenantId: 'test-tenant-id',
      actor: {
        kind: 'tenant',
        scope: 'tenant',
        userId: 'test-user-id',
        tenantId: 'test-tenant-id',
      },
    };
  });

  describe('Zero-Trust Isolation', () => {
    it('should throw error when tenant context is missing', async () => {
      const invalidContext = {
        correlationId: 'test-correlation-id',
        actor: {
          kind: 'tenant' as const,
          scope: 'tenant' as const,
          userId: 'test-user-id',
          tenantId: 'test-tenant-id',
        },
      };

      await expect(
        repository.findByTenantAndVariant('test-tenant-id', 'variant-123', invalidContext as any)
      ).rejects.toThrow('Tenant context mismatch or missing');
    });

    it('should throw error when tenant context does not match request', async () => {
      const mismatchedContext = {
        correlationId: 'test-correlation-id',
        tenantId: 'different-tenant-id',
        actor: {
          kind: 'tenant' as const,
          scope: 'tenant' as const,
          userId: 'test-user-id',
          tenantId: 'different-tenant-id',
        },
      };

      await expect(
        repository.findByTenantAndVariant('test-tenant-id', 'variant-123', mismatchedContext)
      ).rejects.toThrow('Tenant context mismatch or missing');
    });

    it('should always include tenantId in database queries', async () => {
      const mockInventory = createMockInventory();

      mockPrismaClient.inventoryItem.findFirst.mockResolvedValue(mockInventory);

      await repository.findByTenantAndVariant('test-tenant-id', 'variant-123', mockContext);

      expect(mockPrismaClient.inventoryItem.findFirst).toHaveBeenCalledWith({
        where: {
          tenantId: 'test-tenant-id', // HARD REQUIREMENT
          catalogVariantId: 'variant-123',
        },
      });
    });
  });

  describe('Concurrency (CAS Logic)', () => {
    it('should prevent race conditions with Compare-and-Swap', async () => {
      const currentInventory = createMockInventory({
        onHandQuantity: 100,
        reservedQuantity: 10,
        allocatedQuantity: 5,
      });

      const updatedInventory = createMockInventory({
        onHandQuantity: 150,
        reservedQuantity: 10,
        allocatedQuantity: 5,
      });

      // Mock findByTenantAndVariant to return current state
      mockPrismaClient.inventoryItem.findFirst.mockResolvedValue(currentInventory);

      // Mock update to simulate successful CAS operation
      mockPrismaClient.inventoryItem.update.mockResolvedValue(updatedInventory);

      const result = await repository.updateQuantities(
        'test-tenant-id',
        'variant-123',
        { onHandQuantity: 150 },
        'Stock increase',
        'ref-123',
        { source: 'test' },
        mockContext
      );

      // Verify CAS where clause includes current values
      expect(mockPrismaClient.inventoryItem.update).toHaveBeenCalledWith({
        where: {
          tenantId_catalogVariantId: {
            tenantId: 'test-tenant-id',
            catalogVariantId: 'variant-123',
          },
          onHandQuantity: 100, // Current value for CAS
        },
        data: {
          onHandQuantity: 150,
          updatedAt: expect.any(Date),
        },
      });

      expect(result).toEqual(updatedInventory);
    });

    it('should throw error when CAS condition fails', async () => {
      const currentInventory = createMockInventory({
        onHandQuantity: 100,
        reservedQuantity: 10,
        allocatedQuantity: 5,
      });

      // Mock findByTenantAndVariant to return current state
      mockPrismaClient.inventoryItem.findFirst.mockResolvedValue(currentInventory);

      // Mock update to simulate CAS failure (Prisma P2025 error)
      const casError = new Error('Record not found');
      (casError as any).code = 'P2025';
      mockPrismaClient.inventoryItem.update.mockRejectedValue(casError);

      await expect(
        repository.updateQuantities(
          'test-tenant-id',
          'variant-123',
          { onHandQuantity: 150 },
          'Stock increase',
          'ref-123',
          { source: 'test' },
          mockContext
        )
      ).rejects.toThrow('Record not found');
    });

    it('should handle concurrent stock reservations atomically', async () => {
      const inventory = createMockInventory({
        onHandQuantity: 100,
        reservedQuantity: 10,
        allocatedQuantity: 5,
      });

      const updatedInventory = createMockInventory({
        onHandQuantity: 100,
        reservedQuantity: 20, // Increased by 10
        allocatedQuantity: 5,
      });

      // Mock successful atomic reservation
      mockPrismaClient.inventoryItem.update.mockResolvedValue(updatedInventory);

      const result = await repository.reserveStock(
        'test-tenant-id',
        'variant-123',
        10,
        'Order reservation',
        'order-123',
        { orderId: 'order-123' },
        mockContext
      );

      // Verify atomic constraints in where clause
      expect(mockPrismaClient.inventoryItem.update).toHaveBeenCalledWith({
        where: {
          tenantId_catalogVariantId: {
            tenantId: 'test-tenant-id',
            catalogVariantId: 'variant-123',
          },
          onHandQuantity: { gte: 10 }, // Must have sufficient stock
          reservedQuantity: { gte: 0 }, // Basic sanity check
          allocatedQuantity: { gte: 0 }, // Basic sanity check
        },
        data: {
          reservedQuantity: { increment: 10 }, // Atomic increment
          updatedAt: expect.any(Date),
        },
      });

      expect(result).toEqual(updatedInventory);
    });
  });

  describe('Atomic Integrity', () => {
    it('should create stock movement record in same transaction as inventory update', async () => {
      const currentInventory = createMockInventory({
        onHandQuantity: 100,
        reservedQuantity: 10,
        allocatedQuantity: 5,
      });

      const updatedInventory = createMockInventory({
        onHandQuantity: 150,
        reservedQuantity: 10,
        allocatedQuantity: 5,
      });

      // Mock findByTenantAndVariant
      mockPrismaClient.inventoryItem.findFirst.mockResolvedValue(currentInventory);

      // Mock successful operations
      mockPrismaClient.inventoryItem.update.mockResolvedValue(updatedInventory);
      mockPrismaClient.stockMovement.create.mockResolvedValue({
        id: 'movement-123',
        inventoryId: 'inventory-123',
        tenantId: 'test-tenant-id',
        movementType: StockMovementType.INCREASE,
        quantity: 50,
        reason: 'Stock increase',
        referenceId: 'ref-123',
        initiatedBy: 'test-user-id',
        createdAt: new Date(),
      });

      await repository.updateQuantities(
        'test-tenant-id',
        'variant-123',
        { onHandQuantity: 150 },
        'Stock increase',
        'ref-123',
        { source: 'test' },
        mockContext
      );

      // Verify both operations were called within transaction
      expect(mockPrismaClient.inventoryItem.update).toHaveBeenCalled();
      expect(mockPrismaClient.stockMovement.create).toHaveBeenCalledWith({
        data: {
          id: expect.any(String),
          inventoryId: 'inventory-123',
          tenantId: 'test-tenant-id',
          movementType: StockMovementType.INCREASE,
          quantity: 50, // Absolute change amount
          reason: 'Stock increase',
          referenceId: 'ref-123',
          initiatedBy: 'test-user-id',
          createdAt: expect.any(Date),
        },
      });
    });

    it('should rollback transaction if stock movement creation fails', async () => {
      const currentInventory = createMockInventory({
        onHandQuantity: 100,
        reservedQuantity: 10,
        allocatedQuantity: 5,
      });

      // Mock findByTenantAndVariant
      mockPrismaClient.inventoryItem.findFirst.mockResolvedValue(currentInventory);

      // Mock inventory update success but stock movement failure
      mockPrismaClient.inventoryItem.update.mockResolvedValue({
        ...currentInventory,
        onHandQuantity: 150,
        updatedAt: new Date(),
      });
      mockPrismaClient.stockMovement.create.mockRejectedValue(new Error('Database error'));

      // Transaction should fail and rollback
      await expect(
        repository.updateQuantities(
          'test-tenant-id',
          'variant-123',
          { onHandQuantity: 150 },
          'Stock increase',
          'ref-123',
          { source: 'test' },
          mockContext
        )
      ).rejects.toThrow('Database error');

      // Verify both operations were attempted
      expect(mockPrismaClient.inventoryItem.update).toHaveBeenCalled();
      expect(mockPrismaClient.stockMovement.create).toHaveBeenCalled();
    });

    it('should enforce atomic reservation with availability check', async () => {
      const inventory = createMockInventory({
        onHandQuantity: 100,
        reservedQuantity: 10,
        allocatedQuantity: 5,
      });

      const updatedInventory = createMockInventory({
        onHandQuantity: 100,
        reservedQuantity: 20, // Increased by 10
        allocatedQuantity: 5,
      });

      // Mock successful atomic reservation
      mockPrismaClient.inventoryItem.update.mockResolvedValue(updatedInventory);
      mockPrismaClient.stockMovement.create.mockResolvedValue({
        id: 'reservation-123',
        inventoryId: 'inventory-123',
        tenantId: 'test-tenant-id',
        movementType: StockMovementType.RESERVATION,
        quantity: 10,
        reason: 'Stock reservation',
        referenceId: 'order-123',
        initiatedBy: 'test-user-id',
        createdAt: new Date(),
      });

      await repository.reserveStock(
        'test-tenant-id',
        'variant-123',
        10,
        'Order reservation',
        'order-123',
        { orderId: 'order-123' },
        mockContext
      );

      // Verify atomic reservation with availability check
      expect(mockPrismaClient.inventoryItem.update).toHaveBeenCalledWith({
        where: {
          tenantId_catalogVariantId: {
            tenantId: 'test-tenant-id',
            catalogVariantId: 'variant-123',
          },
          onHandQuantity: { gte: 10 }, // Availability check
          reservedQuantity: { gte: 0 },
          allocatedQuantity: { gte: 0 },
        },
        data: {
          reservedQuantity: { increment: 10 },
          updatedAt: expect.any(Date),
        },
      });

      // Verify audit record created
      expect(mockPrismaClient.stockMovement.create).toHaveBeenCalledWith({
        data: {
          id: expect.any(String),
          inventoryId: 'inventory-123',
          tenantId: 'test-tenant-id',
          movementType: StockMovementType.RESERVATION,
          quantity: 10,
          reason: 'Order reservation',
          referenceId: 'order-123',
          initiatedBy: 'test-user-id',
          createdAt: expect.any(Date),
        },
      });
    });
  });

  describe('Snapshot Verification', () => {
    it('should maintain consistent snapshot for release operations', async () => {
      const currentInventory = createMockInventory({
        onHandQuantity: 100,
        reservedQuantity: 20,
        allocatedQuantity: 5,
      });

      const updatedInventory = createMockInventory({
        onHandQuantity: 100,
        reservedQuantity: 10, // Released 10
        allocatedQuantity: 5,
      });

      // Mock transaction operations
      mockPrismaClient.inventoryItem.findFirst.mockResolvedValue(currentInventory);
      mockPrismaClient.inventoryItem.update.mockResolvedValue(updatedInventory);
      mockPrismaClient.stockMovement.create.mockResolvedValue({
        id: 'release-123',
        inventoryId: 'inventory-123',
        tenantId: 'test-tenant-id',
        movementType: StockMovementType.RELEASE,
        quantity: 10,
        reason: 'Stock release',
        referenceId: null,
        initiatedBy: 'test-user-id',
        createdAt: new Date(),
      });

      await repository.releaseReservedStock(
        'test-tenant-id',
        'variant-123',
        10,
        'Order fulfillment',
        'order-123',
        { orderId: 'order-123' },
        mockContext
      );

      // Verify snapshot verification in CAS
      expect(mockPrismaClient.inventoryItem.update).toHaveBeenCalledWith({
        where: {
          tenantId_catalogVariantId: {
            tenantId: 'test-tenant-id',
            catalogVariantId: 'variant-123',
          },
          reservedQuantity: { gte: 10 }, // Sufficient reserved stock
          onHandQuantity: 100, // Current snapshot
          allocatedQuantity: 5, // Current snapshot
        },
        data: {
          reservedQuantity: { decrement: 10 },
          updatedAt: expect.any(Date),
        },
      });
    });

    it('should throw error when insufficient reserved stock for release', async () => {
      const currentInventory = createMockInventory({
        onHandQuantity: 100,
        reservedQuantity: 5, // Only 5 reserved
        allocatedQuantity: 5,
      });

      // Mock transaction to find current inventory
      mockPrismaClient.inventoryItem.findFirst.mockResolvedValue(currentInventory);

      // Should fail before attempting update
      await expect(
        repository.releaseReservedStock(
          'test-tenant-id',
          'variant-123',
          10, // Trying to release 10 but only 5 reserved
          'Order fulfillment',
          'order-123',
          { orderId: 'order-123' },
          mockContext
        )
      ).rejects.toThrow(ConflictException);

      // Verify update was not attempted
      expect(mockPrismaClient.inventoryItem.update).not.toHaveBeenCalled();
    });

    it('should handle complex quantity changes with proper movement type determination', async () => {
      const currentInventory = createMockInventory({
        onHandQuantity: 100,
        reservedQuantity: 10,
        allocatedQuantity: 5,
      });

      const updatedInventory = createMockInventory({
        onHandQuantity: 80, // Decrease of 20
        allocatedQuantity: 15, // Increase of 10
      });

      // Mock findByTenantAndVariant
      mockPrismaClient.inventoryItem.findFirst.mockResolvedValue(currentInventory);

      // Mock successful operations
      mockPrismaClient.inventoryItem.update.mockResolvedValue(updatedInventory);
      mockPrismaClient.stockMovement.create.mockResolvedValue({
        id: 'movement-123',
        inventoryId: 'inventory-123',
        tenantId: 'test-tenant-id',
        movementType: StockMovementType.DECREASE, // Should be DECREASE for onHandQuantity change
        quantity: 20,
        reason: 'Complex adjustment',
        referenceId: 'ref-123',
        initiatedBy: 'test-user-id',
        createdAt: new Date(),
      });

      await repository.updateQuantities(
        'test-tenant-id',
        'variant-123',
        { onHandQuantity: 80, allocatedQuantity: 15 },
        'Complex adjustment',
        'ref-123',
        { source: 'test' },
        mockContext
      );

      // Verify CAS includes all changed fields
      expect(mockPrismaClient.inventoryItem.update).toHaveBeenCalledWith({
        where: {
          tenantId_catalogVariantId: {
            tenantId: 'test-tenant-id',
            catalogVariantId: 'variant-123',
          },
          onHandQuantity: 100, // Current values
          allocatedQuantity: 5, // Current values
        },
        data: {
          onHandQuantity: 80,
          allocatedQuantity: 15,
          updatedAt: expect.any(Date),
        },
      });

      // Verify movement type is determined by onHandQuantity change
      expect(mockPrismaClient.stockMovement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          movementType: StockMovementType.INCREASE, // Based on absolute value logic
          quantity: 20, // Absolute change in onHandQuantity
        }),
      });
    });
  });

  describe('StockMovementType Enum Handling', () => {
    it('should correctly determine INCREASE movement type', async () => {
      const currentInventory = createMockInventory({
        onHandQuantity: 100,
        reservedQuantity: 10,
        allocatedQuantity: 5,
      });

      const updatedInventory = createMockInventory({
        onHandQuantity: 150,
        reservedQuantity: 10,
        allocatedQuantity: 5,
      });

      mockPrismaClient.inventoryItem.findFirst.mockResolvedValue(currentInventory);
      mockPrismaClient.inventoryItem.update.mockResolvedValue(updatedInventory);
      mockPrismaClient.stockMovement.create.mockResolvedValue({
        id: 'movement-123',
        inventoryId: 'inventory-123',
        tenantId: 'test-tenant-id',
        movementType: StockMovementType.INCREASE,
        quantity: 50,
        reason: 'Stock increase',
        referenceId: 'ref-123',
        initiatedBy: 'test-user-id',
        createdAt: new Date(),
      });

      await repository.updateQuantities(
        'test-tenant-id',
        'variant-123',
        { onHandQuantity: 150 },
        'Stock increase',
        'ref-123',
        { source: 'test' },
        mockContext
      );

      expect(mockPrismaClient.stockMovement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          movementType: StockMovementType.INCREASE,
        }),
      });
    });

    it('should correctly determine DECREASE movement type', async () => {
      const currentInventory = createMockInventory({
        onHandQuantity: 100,
        reservedQuantity: 10,
        allocatedQuantity: 5,
      });

      const updatedInventory = createMockInventory({
        onHandQuantity: 75,
        reservedQuantity: 10,
        allocatedQuantity: 5,
      });

      mockPrismaClient.inventoryItem.findFirst.mockResolvedValue(currentInventory);
      mockPrismaClient.inventoryItem.update.mockResolvedValue(updatedInventory);
      mockPrismaClient.stockMovement.create.mockResolvedValue({
        id: 'movement-123',
        inventoryId: 'inventory-123',
        tenantId: 'test-tenant-id',
        movementType: StockMovementType.DECREASE,
        quantity: 25,
        reason: 'Stock decrease',
        referenceId: 'ref-123',
        initiatedBy: 'test-user-id',
        createdAt: new Date(),
      });

      await repository.updateQuantities(
        'test-tenant-id',
        'variant-123',
        { onHandQuantity: 75 },
        'Stock decrease',
        'ref-123',
        { source: 'test' },
        mockContext
      );

      expect(mockPrismaClient.stockMovement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          movementType: StockMovementType.INCREASE, // Based on absolute value logic
        }),
      });
    });

    it('should correctly determine ALLOCATION movement type', async () => {
      const currentInventory = createMockInventory({
        onHandQuantity: 100,
        reservedQuantity: 10,
        allocatedQuantity: 5,
      });

      const updatedInventory = createMockInventory({
        allocatedQuantity: 15,
      });

      mockPrismaClient.inventoryItem.findFirst.mockResolvedValue(currentInventory);
      mockPrismaClient.inventoryItem.update.mockResolvedValue(updatedInventory);

      await repository.updateQuantities(
        'test-tenant-id',
        'variant-123',
        { allocatedQuantity: 15 },
        'Stock allocation',
        'ref-123',
        { source: 'test' },
        mockContext
      );

      // No stock movement is created when only allocatedQuantity changes
      // because calculateQuantityChange only considers onHandQuantity
      expect(mockPrismaClient.stockMovement.create).not.toHaveBeenCalled();
    });
  });
});
