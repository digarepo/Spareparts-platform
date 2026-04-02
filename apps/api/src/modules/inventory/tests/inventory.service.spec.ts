import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StockAdjustmentService } from '../services/commands/stock-adjustment.service';
import { ReservationService } from '../services/commands/reservation.service';
import { InventoryRepository } from '../repositories/inventory.repository';
import { ConflictException } from '@nestjs/common';
import type { CreateAdjustmentDto } from '../dto/requests/create-adjustment.dto';
import type { CreateReservationDto } from '../dto/requests/create-reservation.dto';
import type { RequestContext } from '@spareparts/contracts';

// Mock the domain imports to prevent loading actual services
vi.mock('@spareparts/domains/inventory', () => ({
  InventoryAggregate: vi.fn(),
  InventoryAggregateFactory: {
    fromPrismaEntity: vi.fn(),
  },
  InventoryAggregateValidator: {
    validateInvariants: vi.fn(),
  },
  InventoryAdjustmentService: {
    validateAdjustment: vi.fn(),
    calculateNewQuantities: vi.fn(),
  },
  InventoryReservationService: {
    validateReservation: vi.fn(),
  },
  InventoryQuantityCalculator: {
    canReserve: vi.fn(),
    applyReservation: vi.fn(),
    releaseReservation: vi.fn(),
  },
}));

// Mock the repository
const mockInventoryRepository = {
  findByTenantAndVariant: vi.fn(),
  updateQuantities: vi.fn(),
  reserveStock: vi.fn(),
  releaseReservedStock: vi.fn(),
  getDetailed: vi.fn(),
};

// Mock context
const mockContext: RequestContext = {
  correlationId: 'test-correlation-id',
  tenantId: 'test-tenant-id',
  actor: {
    kind: 'tenant',
    scope: 'tenant',
    userId: 'test-user-id',
    tenantId: 'test-tenant-id',
  },
};

// Mock inventory entity
const mockInventoryEntity = {
  id: 'inventory-123',
  tenantId: 'test-tenant-id',
  catalogVariantId: 'variant-123',
  onHandQuantity: 100,
  reservedQuantity: 20,
  allocatedQuantity: 10,
  isActive: true,
  isSellable: true,
  lowStockThreshold: 5,
  location: 'warehouse-1',
  source: 'manual',
  unitCost: 10.50,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Inventory Services (Unit Tests)', () => {
  let stockAdjustmentService: StockAdjustmentService;
  let reservationService: ReservationService;

  beforeEach(() => {
    vi.clearAllMocks();
    
    stockAdjustmentService = new StockAdjustmentService(
      mockInventoryRepository as any
    );
    
    reservationService = new ReservationService(
      mockInventoryRepository as any
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('StockAdjustmentService', () => {
    const validAdjustmentRequest: CreateAdjustmentDto = {
      tenantId: 'test-tenant-id',
      catalogVariantId: 'variant-123',
      adjustment: {
        adjustmentType: 'increase',
        quantity: 10,
        reason: 'Stock increase',
        referenceId: '550e8400-e29b-41d4-a716-446655440000',
      },
      metadata: {
        initiatedBy: 'test-user',
        notes: 'Test adjustment',
      },
    };

    describe('Validation: NotFoundException', () => {
      it('should throw ConflictException when inventory item does not exist', async () => {
        // Arrange
        mockInventoryRepository.findByTenantAndVariant.mockResolvedValue(null);

        // Act & Assert
        await expect(
          stockAdjustmentService.adjustStock(validAdjustmentRequest, mockContext)
        ).rejects.toThrow(
          ConflictException
        );

        await expect(
          stockAdjustmentService.adjustStock(validAdjustmentRequest, mockContext)
        ).rejects.toThrow(
          'Inventory not found for tenant=test-tenant-id, variant=variant-123'
        );
      });
    });

    describe('Math Integrity', () => {
      it('should correctly calculate available quantity as onHand - reserved - allocated', async () => {
        // Arrange
        mockInventoryRepository.findByTenantAndVariant.mockResolvedValue(mockInventoryEntity);
        
        const { InventoryAggregateFactory, InventoryAdjustmentService, InventoryAggregateValidator } = 
          await import('@spareparts/domains/inventory');
        
        (InventoryAggregateFactory.fromPrismaEntity as any).mockReturnValue({
          quantities: {
            onHand: 100,
            reserved: 20,
            allocated: 10,
            available: 70, // 100 - 20 - 10
          },
        });

        (InventoryAdjustmentService.validateAdjustment as any).mockReturnValue({
          isValid: true,
          errors: [],
          warnings: [],
        });

        (InventoryAdjustmentService.calculateNewQuantities as any).mockReturnValue({
          onHandQuantity: 110,
          reservedQuantity: 20,
          allocatedQuantity: 10,
        });

        (InventoryAggregateValidator.validateInvariants as any).mockReturnValue(undefined);

        const updatedInventory = {
          ...mockInventoryEntity,
          onHandQuantity: 110,
          reservedQuantity: 20,
          allocatedQuantity: 10,
        };

        mockInventoryRepository.updateQuantities.mockResolvedValue(updatedInventory);

        // Act
        const result = await stockAdjustmentService.adjustStock(validAdjustmentRequest, mockContext);

        // Assert
        expect(result.quantities.available).toBe(80); // 110 - 20 - 10
        expect(result.quantities.onHand).toBe(110);
        expect(result.quantities.reserved).toBe(20);
        expect(result.quantities.allocated).toBe(10);
      });

      it('should handle complex quantity calculations correctly', async () => {
        // Arrange
        const complexInventory = {
          ...mockInventoryEntity,
          onHandQuantity: 200,
          reservedQuantity: 50,
          allocatedQuantity: 30,
        };

        mockInventoryRepository.findByTenantAndVariant.mockResolvedValue(complexInventory);
        
        const { InventoryAggregateFactory, InventoryAdjustmentService, InventoryAggregateValidator } = 
          await import('@spareparts/domains/inventory');
        
        (InventoryAggregateFactory.fromPrismaEntity as any).mockReturnValue({
          quantities: {
            onHand: 200,
            reserved: 50,
            allocated: 30,
            available: 120, // 200 - 50 - 30
          },
        });

        (InventoryAdjustmentService.validateAdjustment as any).mockReturnValue({
          isValid: true,
          errors: [],
          warnings: [],
        });

        (InventoryAdjustmentService.calculateNewQuantities as any).mockReturnValue({
          onHandQuantity: 180, // Decrease by 20
          reservedQuantity: 50,
          allocatedQuantity: 30,
        });

        (InventoryAggregateValidator.validateInvariants as any).mockReturnValue(undefined);

        const updatedInventory = {
          ...complexInventory,
          onHandQuantity: 180,
          reservedQuantity: 50,
          allocatedQuantity: 30,
        };

        mockInventoryRepository.updateQuantities.mockResolvedValue(updatedInventory);

        const decreaseRequest: CreateAdjustmentDto = {
          ...validAdjustmentRequest,
          adjustment: {
            ...validAdjustmentRequest.adjustment,
            adjustmentType: 'decrease',
            quantity: 20,
          },
        };

        // Act
        const result = await stockAdjustmentService.adjustStock(decreaseRequest, mockContext);

        // Assert
        expect(result.quantities.available).toBe(100); // 180 - 50 - 30
        expect(result.quantities.onHand).toBe(180);
      });
    });

    describe('Conflict Handling', () => {
      it('should bubble up ConflictException from repository CAS failure', async () => {
        // Arrange
        mockInventoryRepository.findByTenantAndVariant.mockResolvedValue(mockInventoryEntity);
        
        const { InventoryAggregateFactory, InventoryAdjustmentService, InventoryAggregateValidator } = 
          await import('@spareparts/domains/inventory');
        
        (InventoryAggregateFactory.fromPrismaEntity as any).mockReturnValue({
          quantities: { onHand: 100, reserved: 20, allocated: 10, available: 70 },
        });

        (InventoryAdjustmentService.validateAdjustment as any).mockReturnValue({
          isValid: true,
          errors: [],
          warnings: [],
        });

        (InventoryAdjustmentService.calculateNewQuantities as any).mockReturnValue({
          onHandQuantity: 110,
          reservedQuantity: 20,
          allocatedQuantity: 10,
        });

        (InventoryAggregateValidator.validateInvariants as any).mockReturnValue(undefined);

        const casError = new Error('CAS failure: Record was modified by another transaction');
        mockInventoryRepository.updateQuantities.mockRejectedValue(casError);

        // Act & Assert
        await expect(
          stockAdjustmentService.adjustStock(validAdjustmentRequest, mockContext)
        ).rejects.toThrow(casError);
      });

      it('should handle domain validation errors and convert to ConflictException', async () => {
        // Arrange
        mockInventoryRepository.findByTenantAndVariant.mockResolvedValue(mockInventoryEntity);
        
        const { InventoryAggregateFactory, InventoryAdjustmentService } = 
          await import('@spareparts/domains/inventory');
        
        (InventoryAggregateFactory.fromPrismaEntity as any).mockReturnValue({
          quantities: { onHand: 100, reserved: 20, allocated: 10, available: 70 },
        });

        (InventoryAdjustmentService.validateAdjustment as any).mockReturnValue({
          isValid: false,
          errors: ['Insufficient stock for decrease', 'Negative quantity not allowed'],
          warnings: [],
        });

        // Act & Assert
        await expect(
          stockAdjustmentService.adjustStock(validAdjustmentRequest, mockContext)
        ).rejects.toThrow(
          ConflictException
        );

        await expect(
          stockAdjustmentService.adjustStock(validAdjustmentRequest, mockContext)
        ).rejects.toThrow(
          'Validation failed: Insufficient stock for decrease, Negative quantity not allowed'
        );
      });

      it('should handle domain invariant violations and convert to ConflictException', async () => {
        // Arrange
        mockInventoryRepository.findByTenantAndVariant.mockResolvedValue(mockInventoryEntity);
        
        const { InventoryAggregateFactory, InventoryAdjustmentService, InventoryAggregateValidator } = 
          await import('@spareparts/domains/inventory');
        
        (InventoryAggregateFactory.fromPrismaEntity as any).mockReturnValue({
          quantities: { onHand: 100, reserved: 20, allocated: 10, available: 70 },
        });

        (InventoryAdjustmentService.validateAdjustment as any).mockReturnValue({
          isValid: true,
          errors: [],
          warnings: [],
        });

        (InventoryAdjustmentService.calculateNewQuantities as any).mockReturnValue({
          onHandQuantity: -10, // Invalid negative quantity
          reservedQuantity: 20,
          allocatedQuantity: 10,
        });

        const invariantError = new Error('On-hand quantity cannot be negative');
        (InventoryAggregateValidator.validateInvariants as any).mockImplementation(() => {
          throw invariantError;
        });

        // Act & Assert
        await expect(
          stockAdjustmentService.adjustStock(validAdjustmentRequest, mockContext)
        ).rejects.toThrow(
          ConflictException
        );

        await expect(
          stockAdjustmentService.adjustStock(validAdjustmentRequest, mockContext)
        ).rejects.toThrow(
          'Invariant violation: On-hand quantity cannot be negative'
        );
      });
    });

    describe('Negative Stock Prevention', () => {
      it('should prevent adjustment that results in negative on-hand quantity', async () => {
        // Arrange
        mockInventoryRepository.findByTenantAndVariant.mockResolvedValue(mockInventoryEntity);
        
        const { InventoryAggregateFactory, InventoryAdjustmentService, InventoryAggregateValidator } = 
          await import('@spareparts/domains/inventory');
        
        (InventoryAggregateFactory.fromPrismaEntity as any).mockReturnValue({
          quantities: { onHand: 100, reserved: 20, allocated: 10, available: 70 },
        });

        (InventoryAdjustmentService.validateAdjustment as any).mockReturnValue({
          isValid: true,
          errors: [],
          warnings: [],
        });

        (InventoryAdjustmentService.calculateNewQuantities as any).mockReturnValue({
          onHandQuantity: -50, // Negative result
          reservedQuantity: 20,
          allocatedQuantity: 10,
        });

        const invariantError = new Error('On-hand quantity cannot be negative');
        (InventoryAggregateValidator.validateInvariants as any).mockImplementation(() => {
          throw invariantError;
        });

        const negativeRequest: CreateAdjustmentDto = {
          ...validAdjustmentRequest,
          adjustment: {
            ...validAdjustmentRequest.adjustment,
            adjustmentType: 'decrease',
            quantity: 150, // More than available
          },
        };

        // Act & Assert
        await expect(
          stockAdjustmentService.adjustStock(negativeRequest, mockContext)
        ).rejects.toThrow(
          'Invariant violation: On-hand quantity cannot be negative'
        );
      });

      it('should allow adjustment that results in zero on-hand quantity', async () => {
        // Arrange
        mockInventoryRepository.findByTenantAndVariant.mockResolvedValue(mockInventoryEntity);
        
        const { InventoryAggregateFactory, InventoryAdjustmentService, InventoryAggregateValidator } = 
          await import('@spareparts/domains/inventory');
        
        (InventoryAggregateFactory.fromPrismaEntity as any).mockReturnValue({
          quantities: { onHand: 100, reserved: 20, allocated: 10, available: 70 },
        });

        (InventoryAdjustmentService.validateAdjustment as any).mockReturnValue({
          isValid: true,
          errors: [],
          warnings: ['Stock will be depleted'],
        });

        (InventoryAdjustmentService.calculateNewQuantities as any).mockReturnValue({
          onHandQuantity: 0, // Zero is allowed
          reservedQuantity: 20,
          allocatedQuantity: 10,
        });

        (InventoryAggregateValidator.validateInvariants as any).mockReturnValue(undefined);

        const updatedInventory = {
          ...mockInventoryEntity,
          onHandQuantity: 0,
          reservedQuantity: 20,
          allocatedQuantity: 10,
        };

        mockInventoryRepository.updateQuantities.mockResolvedValue(updatedInventory);

        const zeroRequest: CreateAdjustmentDto = {
          ...validAdjustmentRequest,
          adjustment: {
            ...validAdjustmentRequest.adjustment,
            adjustmentType: 'decrease',
            quantity: 100, // Exactly all on-hand
          },
        };

        // Act
        const result = await stockAdjustmentService.adjustStock(zeroRequest, mockContext);

        // Assert
        expect(result.quantities.onHand).toBe(0);
        expect(result.quantities.available).toBe(-30); // 0 - 20 - 10 (negative available is allowed)
        expect(result.warnings).toEqual(['Stock will be depleted']);
      });
    });
  });

  describe('ReservationService', () => {
    const validReservationRequest: CreateReservationDto = {
      tenantId: 'test-tenant-id',
      catalogVariantId: 'variant-123',
      quantity: 20,
      purpose: 'cart',
      expiresAt: new Date('2024-12-31T23:59:59Z'),
      referenceId: '550e8400-e29b-41d4-a716-446655440000',
      metadata: {
        initiatedBy: 'test-user',
        notes: 'Cart reservation',
      },
    };

    describe('Validation: NotFoundException', () => {
      it('should throw ConflictException when inventory item does not exist', async () => {
        // Arrange
        mockInventoryRepository.findByTenantAndVariant.mockResolvedValue(null);

        // Act & Assert
        await expect(
          reservationService.createReservation(validReservationRequest, mockContext)
        ).rejects.toThrow(
          ConflictException
        );

        await expect(
          reservationService.createReservation(validReservationRequest, mockContext)
        ).rejects.toThrow(
          'Inventory not found for tenant=test-tenant-id, variant=variant-123'
        );
      });
    });

    describe('Math Integrity', () => {
      it('should correctly calculate available quantity as onHand - reserved - allocated', async () => {
        // Arrange
        mockInventoryRepository.findByTenantAndVariant.mockResolvedValue(mockInventoryEntity);
        
        const { InventoryAggregateFactory, InventoryQuantityCalculator, InventoryAggregateValidator } = 
          await import('@spareparts/domains/inventory');
        
        (InventoryAggregateFactory.fromPrismaEntity as any).mockReturnValue({
          quantities: {
            onHand: 100,
            reserved: 20,
            allocated: 10,
            available: 70, // 100 - 20 - 10
          },
        });

        (InventoryQuantityCalculator.canReserve as any).mockReturnValue(true);
        (InventoryQuantityCalculator.applyReservation as any).mockReturnValue({
          onHand: 100,
          reserved: 40, // 20 + 20 reserved
          allocated: 10,
          available: 50, // 100 - 40 - 10
        });

        (InventoryAggregateValidator.validateInvariants as any).mockReturnValue(undefined);

        const updatedInventory = {
          ...mockInventoryEntity,
          reservedQuantity: 40,
        };

        mockInventoryRepository.reserveStock.mockResolvedValue(updatedInventory);

        // Act
        const result = await reservationService.createReservation(validReservationRequest, mockContext);

        // Assert
        expect(result.quantities.available).toBe(50); // 100 - 40 - 10
        expect(result.quantities.onHand).toBe(100);
        expect(result.quantities.reserved).toBe(40);
        expect(result.quantities.allocated).toBe(10);
      });

      it('should prevent reservation when available quantity is insufficient', async () => {
        // Arrange
        mockInventoryRepository.findByTenantAndVariant.mockResolvedValue(mockInventoryEntity);
        
        const { InventoryAggregateFactory, InventoryQuantityCalculator } = 
          await import('@spareparts/domains/inventory');
        
        (InventoryAggregateFactory.fromPrismaEntity as any).mockReturnValue({
          quantities: {
            onHand: 100,
            reserved: 20,
            allocated: 10,
            available: 70, // 100 - 20 - 10
          },
        });

        (InventoryQuantityCalculator.canReserve as any).mockReturnValue(false);

        const largeReservationRequest: CreateReservationDto = {
          ...validReservationRequest,
          quantity: 100, // More than available (70)
        };

        // Act & Assert
        await expect(
          reservationService.createReservation(largeReservationRequest, mockContext)
        ).rejects.toThrow(
          ConflictException
        );

        await expect(
          reservationService.createReservation(largeReservationRequest, mockContext)
        ).rejects.toThrow(
          'Insufficient available quantity. Available: 70, Requested: 100'
        );
      });
    });

    describe('Conflict Handling', () => {
      it('should bubble up ConflictException from repository CAS failure', async () => {
        // Arrange
        mockInventoryRepository.findByTenantAndVariant.mockResolvedValue(mockInventoryEntity);
        
        const { InventoryAggregateFactory, InventoryQuantityCalculator, InventoryAggregateValidator } = 
          await import('@spareparts/domains/inventory');
        
        (InventoryAggregateFactory.fromPrismaEntity as any).mockReturnValue({
          quantities: { onHand: 100, reserved: 20, allocated: 10, available: 70 },
        });

        (InventoryQuantityCalculator.canReserve as any).mockReturnValue(true);
        (InventoryQuantityCalculator.applyReservation as any).mockReturnValue({
          onHand: 100,
          reserved: 40,
          allocated: 10,
          available: 50,
        });

        (InventoryAggregateValidator.validateInvariants as any).mockReturnValue(undefined);

        const casError = new Error('CAS failure: Record was modified by another transaction');
        mockInventoryRepository.reserveStock.mockRejectedValue(casError);

        // Act & Assert
        await expect(
          reservationService.createReservation(validReservationRequest, mockContext)
        ).rejects.toThrow(casError);
      });

      it('should handle domain invariant violations and convert to ConflictException', async () => {
        // Arrange
        mockInventoryRepository.findByTenantAndVariant.mockResolvedValue(mockInventoryEntity);
        
        const { InventoryAggregateFactory, InventoryQuantityCalculator, InventoryAggregateValidator } = 
          await import('@spareparts/domains/inventory');
        
        (InventoryAggregateFactory.fromPrismaEntity as any).mockReturnValue({
          quantities: { onHand: 100, reserved: 20, allocated: 10, available: 70 },
        });

        (InventoryQuantityCalculator.canReserve as any).mockReturnValue(true);
        (InventoryQuantityCalculator.applyReservation as any).mockReturnValue({
          onHand: 100,
          reserved: 150, // Invalid: more reserved than on-hand
          allocated: 10,
          available: -60,
        });

        const invariantError = new Error('Reserved quantity cannot exceed on-hand quantity');
        (InventoryAggregateValidator.validateInvariants as any).mockImplementation(() => {
          throw invariantError;
        });

        // Act & Assert
        await expect(
          reservationService.createReservation(validReservationRequest, mockContext)
        ).rejects.toThrow(
          'Invariant violation: Reserved quantity cannot exceed on-hand quantity'
        );
      });
    });

    describe('Negative Stock Prevention', () => {
      it('should prevent reservation that would result in negative available quantity', async () => {
        // Arrange
        mockInventoryRepository.findByTenantAndVariant.mockResolvedValue(mockInventoryEntity);
        
        const { InventoryAggregateFactory, InventoryQuantityCalculator } = 
          await import('@spareparts/domains/inventory');
        
        (InventoryAggregateFactory.fromPrismaEntity as any).mockReturnValue({
          quantities: {
            onHand: 100,
            reserved: 20,
            allocated: 10,
            available: 70, // 100 - 20 - 10
          },
        });

        (InventoryQuantityCalculator.canReserve as any).mockReturnValue(false);

        const oversizeReservationRequest: CreateReservationDto = {
          ...validReservationRequest,
          quantity: 80, // More than available (70)
        };

        // Act & Assert
        await expect(
          reservationService.createReservation(oversizeReservationRequest, mockContext)
        ).rejects.toThrow(
          'Insufficient available quantity. Available: 70, Requested: 80'
        );
      });

      it('should allow reservation that uses all available quantity', async () => {
        // Arrange
        mockInventoryRepository.findByTenantAndVariant.mockResolvedValue(mockInventoryEntity);
        
        const { InventoryAggregateFactory, InventoryQuantityCalculator, InventoryAggregateValidator } = 
          await import('@spareparts/domains/inventory');
        
        (InventoryAggregateFactory.fromPrismaEntity as any).mockReturnValue({
          quantities: {
            onHand: 100,
            reserved: 20,
            allocated: 10,
            available: 70, // 100 - 20 - 10
          },
        });

        (InventoryQuantityCalculator.canReserve as any).mockReturnValue(true);
        (InventoryQuantityCalculator.applyReservation as any).mockReturnValue({
          onHand: 100,
          reserved: 90, // 20 + 70 = 90
          allocated: 10,
          available: 0, // 100 - 90 - 10 = 0
        });

        (InventoryAggregateValidator.validateInvariants as any).mockReturnValue(undefined);

        const updatedInventory = {
          ...mockInventoryEntity,
          reservedQuantity: 90,
        };

        mockInventoryRepository.reserveStock.mockResolvedValue(updatedInventory);

        const maxReservationRequest: CreateReservationDto = {
          ...validReservationRequest,
          quantity: 70, // Exactly all available
        };

        // Act
        const result = await reservationService.createReservation(maxReservationRequest, mockContext);

        // Assert
        expect(result.quantities.available).toBe(0);
        expect(result.quantities.reserved).toBe(90);
        expect(result.success).toBe(true);
      });
    });

    describe('Edge Cases', () => {
      it('should include low availability warning when available quantity is low', async () => {
        // Arrange
        const lowStockInventory = {
          ...mockInventoryEntity,
          onHandQuantity: 100,
          reservedQuantity: 85,
          allocatedQuantity: 10,
        };

        mockInventoryRepository.findByTenantAndVariant.mockResolvedValue(lowStockInventory);
        
        const { InventoryAggregateFactory, InventoryQuantityCalculator, InventoryAggregateValidator } = 
          await import('@spareparts/domains/inventory');
        
        (InventoryAggregateFactory.fromPrismaEntity as any).mockReturnValue({
          quantities: {
            onHand: 100,
            reserved: 85,
            allocated: 10,
            available: 5, // 100 - 85 - 10 = 5 (low availability)
          },
        });

        (InventoryQuantityCalculator.canReserve as any).mockReturnValue(true);
        (InventoryQuantityCalculator.applyReservation as any).mockReturnValue({
          onHand: 100,
          reserved: 90, // 85 + 5
          allocated: 10,
          available: 0, // 100 - 90 - 10 = 0
        });

        (InventoryAggregateValidator.validateInvariants as any).mockReturnValue(undefined);

        const updatedInventory = {
          ...lowStockInventory,
          reservedQuantity: 90,
        };

        mockInventoryRepository.reserveStock.mockResolvedValue(updatedInventory);

        const smallReservationRequest: CreateReservationDto = {
          ...validReservationRequest,
          quantity: 5, // Small quantity that will trigger warning
        };

        // Act
        const result = await reservationService.createReservation(smallReservationRequest, mockContext);

        // Assert
        expect(result.warnings).toEqual(['Low availability warning']);
      });

      it('should handle reservation with default expiration when none provided', async () => {
        // Arrange
        mockInventoryRepository.findByTenantAndVariant.mockResolvedValue(mockInventoryEntity);
        
        const { InventoryAggregateFactory, InventoryQuantityCalculator, InventoryAggregateValidator } = 
          await import('@spareparts/domains/inventory');
        
        (InventoryAggregateFactory.fromPrismaEntity as any).mockReturnValue({
          quantities: { onHand: 100, reserved: 20, allocated: 10, available: 70 },
        });

        (InventoryQuantityCalculator.canReserve as any).mockReturnValue(true);
        (InventoryQuantityCalculator.applyReservation as any).mockReturnValue({
          onHand: 100,
          reserved: 40,
          allocated: 10,
          available: 50,
        });

        (InventoryAggregateValidator.validateInvariants as any).mockReturnValue(undefined);

        const updatedInventory = {
          ...mockInventoryEntity,
          reservedQuantity: 40,
        };

        mockInventoryRepository.reserveStock.mockResolvedValue(updatedInventory);

        const reservationWithoutExpiration: CreateReservationDto = {
          ...validReservationRequest,
          expiresAt: undefined, // No expiration provided
        };

        // Act
        const result = await reservationService.createReservation(reservationWithoutExpiration, mockContext);

        // Assert
        expect(result.reservation.expiresAt).toBeInstanceOf(Date);
        // Should be approximately 1 hour from now (allowing for test execution time)
        const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
        expect(result.reservation.expiresAt.getTime()).toBeCloseTo(oneHourFromNow.getTime(), -3); // Within 1 second
      });
    });
  });

  describe('Service Integration', () => {
    it('should demonstrate coordination between adjustment and reservation services', async () => {
      // This test shows how the services work together to maintain inventory integrity
      
      // Arrange - Initial state: 100 on-hand, 20 reserved, 10 allocated = 70 available
      mockInventoryRepository.findByTenantAndVariant.mockResolvedValue(mockInventoryEntity);
      
      const { 
        InventoryAggregateFactory, 
        InventoryAdjustmentService, 
        InventoryQuantityCalculator, 
        InventoryAggregateValidator 
      } = await import('@spareparts/domains/inventory');
      
      // Mock adjustment service domain calls
      (InventoryAggregateFactory.fromPrismaEntity as any).mockReturnValue({
        quantities: { onHand: 100, reserved: 20, allocated: 10, available: 70 },
      });

      (InventoryAdjustmentService.validateAdjustment as any).mockReturnValue({
        isValid: true,
        errors: [],
        warnings: [],
      });

      (InventoryAdjustmentService.calculateNewQuantities as any).mockReturnValue({
        onHandQuantity: 150, // Increase by 50
        reservedQuantity: 20,
        allocatedQuantity: 10,
      });

      (InventoryAggregateValidator.validateInvariants as any).mockReturnValue(undefined);

      const adjustedInventory = {
        ...mockInventoryEntity,
        onHandQuantity: 150,
        reservedQuantity: 20,
        allocatedQuantity: 10,
      };

      mockInventoryRepository.updateQuantities.mockResolvedValue(adjustedInventory);

      // Act - Increase stock by 50
      const adjustmentRequest: CreateAdjustmentDto = {
        tenantId: 'test-tenant-id',
        catalogVariantId: 'variant-123',
        adjustment: {
          adjustmentType: 'increase',
          quantity: 50,
          reason: 'Stock replenishment',
          referenceId: 'adjustment-123',
        },
        metadata: {
          initiatedBy: 'test-user',
          notes: 'Replenishment',
        },
      };

      const adjustmentResult = await stockAdjustmentService.adjustStock(adjustmentRequest, mockContext);

      // Assert - After adjustment: 150 on-hand, 20 reserved, 10 allocated = 120 available
      expect(adjustmentResult.quantities.onHand).toBe(150);
      expect(adjustmentResult.quantities.available).toBe(120); // 150 - 20 - 10

      // Arrange - Now make a reservation using the increased stock
      (InventoryQuantityCalculator.canReserve as any).mockReturnValue(true);
      (InventoryQuantityCalculator.applyReservation as any).mockReturnValue({
        onHand: 150,
        reserved: 70, // 20 + 50 reserved
        allocated: 10,
        available: 70, // 150 - 70 - 10
      });

      const reservedInventory = {
        ...adjustedInventory,
        reservedQuantity: 70,
      };

      mockInventoryRepository.reserveStock.mockResolvedValue(reservedInventory);

      // Act - Reserve 50 units from the newly available stock
      const reservationRequest: CreateReservationDto = {
        tenantId: 'test-tenant-id',
        catalogVariantId: 'variant-123',
        quantity: 50,
        purpose: 'cart',
        expiresAt: new Date('2024-12-31T23:59:59Z'),
        referenceId: 'reservation-123',
        metadata: {
          initiatedBy: 'test-user',
          notes: 'Cart reservation',
        },
      };

      const reservationResult = await reservationService.createReservation(reservationRequest, mockContext);

      // Assert - Final state: 150 on-hand, 70 reserved, 10 allocated = 70 available
      expect(reservationResult.quantities.onHand).toBe(150);
      expect(reservationResult.quantities.reserved).toBe(70);
      expect(reservationResult.quantities.available).toBe(70); // 150 - 70 - 10
      
      // Verify the math integrity throughout the flow
      expect(adjustmentResult.quantities.available).toBe(120); // After adjustment
      expect(reservationResult.quantities.available).toBe(70);  // After reservation
      expect(adjustmentResult.quantities.onHand).toBe(reservationResult.quantities.onHand); // On-hand unchanged by reservation
    });
  });
});
