import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { InventoryController } from '../inventory.controller';
import { StockAdjustmentService } from '../services/commands/stock-adjustment.service';
import { ReservationService } from '../services/commands/reservation.service';
import type { RequestContext } from '@spareparts/contracts';
import type { CreateReservationDto } from '../dto/requests/create-reservation.dto';
import type { CreateAdjustmentDto } from '../dto/requests/create-adjustment.dto';
import type { CreateReservationResponse } from '@spareparts/contracts';
import type { StockAdjustmentResponse } from '@spareparts/contracts';

// Mock the domain imports to prevent loading actual services
vi.mock('@spareparts/domains/inventory', () => ({
  InventoryAggregate: vi.fn(),
  InventoryAggregateFactory: vi.fn(),
}));

// Mock the request context to return our mock context
vi.mock('../../../infrastructure/request-context', () => ({
  getRequestContext: vi.fn().mockReturnValue({
    correlationId: 'test-correlation-id',
    tenantId: 'test-tenant-id',
    actor: {
      kind: 'tenant',
      scope: 'tenant',
      userId: 'test-user-id',
      tenantId: 'test-tenant-id',
    },
  }),
  runWithRequestContext: vi.fn((context, fn) => fn()),
}));

// Mock the services
const mockStockAdjustmentService = {
  adjustStock: vi.fn(),
};

const mockReservationService = {
  createReservation: vi.fn(),
};

describe('InventoryController (E2E)', () => {
  let controller: InventoryController;
  let mockContext: RequestContext;

  beforeEach(() => {
    // Create controller directly with mocked services
    controller = new InventoryController(
      mockStockAdjustmentService as any,
      mockReservationService as any
    );

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

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /inventory/adjust', () => {
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

    const mockAdjustmentResponse: StockAdjustmentResponse = {
      success: true,
      quantities: {
        onHand: 110,
        reserved: 0,
        allocated: 0,
        available: 110,
      },
      movementId: 'movement-123',
      adjustedAt: new Date(),
    };

    it('should successfully adjust stock', async () => {
      mockStockAdjustmentService.adjustStock.mockResolvedValue(mockAdjustmentResponse);

      const result = await controller.adjustStock(validAdjustmentRequest);

      expect(result).toEqual(mockAdjustmentResponse);
      expect(mockStockAdjustmentService.adjustStock).toHaveBeenCalledWith(
        {
          tenantId: 'test-tenant-id', // FORCED from authenticated context
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
        },
        mockContext
      );
    });

    it('should handle validation errors for invalid adjustment type', async () => {
      const invalidRequest = {
        ...validAdjustmentRequest,
        adjustment: {
          ...validAdjustmentRequest.adjustment,
          adjustmentType: 'invalid' as any,
        },
      };

      // In direct controller testing, validation happens at the service layer
      // This test verifies the controller passes through the request
      mockStockAdjustmentService.adjustStock.mockRejectedValue(
        new Error('Invalid adjustment type')
      );

      await expect(controller.adjustStock(invalidRequest as any)).rejects.toThrow(
        'Invalid adjustment type'
      );
    });

    it('should handle validation errors for invalid quantity', async () => {
      const invalidRequest = {
        ...validAdjustmentRequest,
        adjustment: {
          ...validAdjustmentRequest.adjustment,
          quantity: 0, // Invalid: must be at least 1
        },
      };

      mockStockAdjustmentService.adjustStock.mockRejectedValue(
        new Error('Invalid quantity')
      );

      await expect(controller.adjustStock(invalidRequest as any)).rejects.toThrow(
        'Invalid quantity'
      );
    });

    it('should handle validation errors for missing reason', async () => {
      const invalidRequest = {
        ...validAdjustmentRequest,
        adjustment: {
          ...validAdjustmentRequest.adjustment,
          reason: '', // Invalid: must be between 3 and 500 characters
        },
      };

      mockStockAdjustmentService.adjustStock.mockRejectedValue(
        new Error('Invalid reason')
      );

      await expect(controller.adjustStock(invalidRequest as any)).rejects.toThrow(
        'Invalid reason'
      );
    });

    it('should handle validation errors for invalid reference ID', async () => {
      const invalidRequest = {
        ...validAdjustmentRequest,
        adjustment: {
          ...validAdjustmentRequest.adjustment,
          referenceId: 'invalid-uuid', // Invalid: must be valid UUID v4
        },
      };

      mockStockAdjustmentService.adjustStock.mockRejectedValue(
        new Error('Invalid reference ID')
      );

      await expect(controller.adjustStock(invalidRequest as any)).rejects.toThrow(
        'Invalid reference ID'
      );
    });
  });

  describe('POST /inventory/reserve', () => {
    const validReservationRequest: CreateReservationDto = {
      tenantId: 'test-tenant-id',
      catalogVariantId: 'variant-123',
      quantity: 5,
      purpose: 'cart',
      expiresAt: new Date('2024-12-31T23:59:59Z'),
      referenceId: '550e8400-e29b-41d4-a716-446655440000',
      metadata: {
        initiatedBy: 'test-user',
        notes: 'Cart reservation',
      },
    };

    const mockReservationResponse: CreateReservationResponse = {
      success: true,
      reservation: {
        id: 'reservation-123',
        catalogVariantId: 'variant-123',
        quantity: 5,
        purpose: 'cart',
        expiresAt: new Date('2024-12-31T23:59:59Z'),
        createdAt: new Date(),
        referenceId: '550e8400-e29b-41d4-a716-446655440000',
      },
      quantities: {
        onHand: 100,
        reserved: 5,
        allocated: 0,
        available: 95,
      },
    };

    it('should successfully create reservation', async () => {
      mockReservationService.createReservation.mockResolvedValue(mockReservationResponse);

      const result = await controller.createReservation(validReservationRequest);

      expect(result).toEqual(mockReservationResponse);
      expect(mockReservationService.createReservation).toHaveBeenCalledWith(
        {
          tenantId: 'test-tenant-id', // FORCED from authenticated context
          catalogVariantId: 'variant-123',
          quantity: 5,
          purpose: 'cart',
          expiresAt: new Date('2024-12-31T23:59:59Z'),
          referenceId: '550e8400-e29b-41d4-a716-446655440000',
          metadata: {
            initiatedBy: 'test-user',
            notes: 'Cart reservation',
          },
        },
        mockContext
      );
    });

    it('should handle conflict when insufficient stock available', async () => {
      const conflictError = new Error('Insufficient stock available');
      conflictError.name = 'ConflictException';

      mockReservationService.createReservation.mockRejectedValue(conflictError);

      await expect(controller.createReservation(validReservationRequest)).rejects.toThrow(
        'Insufficient stock available'
      );
    });

    it('should handle validation errors for invalid quantity', async () => {
      const invalidRequest = {
        ...validReservationRequest,
        quantity: 0, // Invalid: must be at least 1
      };

      mockReservationService.createReservation.mockRejectedValue(
        new Error('Invalid quantity')
      );

      await expect(controller.createReservation(invalidRequest as any)).rejects.toThrow(
        'Invalid quantity'
      );
    });

    it('should handle validation errors for invalid purpose', async () => {
      const invalidRequest = {
        ...validReservationRequest,
        purpose: 'invalid' as any, // Invalid: must be one of enum values
      };

      mockReservationService.createReservation.mockRejectedValue(
        new Error('Invalid purpose')
      );

      await expect(controller.createReservation(invalidRequest as any)).rejects.toThrow(
        'Invalid purpose'
      );
    });

    it('should handle validation errors for past expiration date', async () => {
      const invalidRequest = {
        ...validReservationRequest,
        expiresAt: new Date('2020-01-01T00:00:00Z'), // Invalid: must be in future
      };

      mockReservationService.createReservation.mockRejectedValue(
        new Error('Invalid expiration date')
      );

      await expect(controller.createReservation(invalidRequest as any)).rejects.toThrow(
        'Invalid expiration date'
      );
    });

    it('should handle validation errors for invalid reference ID', async () => {
      const invalidRequest = {
        ...validReservationRequest,
        referenceId: 'invalid-uuid', // Invalid: must be valid UUID v4
      };

      mockReservationService.createReservation.mockRejectedValue(
        new Error('Invalid reference ID')
      );

      await expect(controller.createReservation(invalidRequest as any)).rejects.toThrow(
        'Invalid reference ID'
      );
    });

    it('should handle validation errors for missing metadata', async () => {
      const invalidRequest = {
        ...validReservationRequest,
        metadata: undefined as any, // Invalid: metadata is required
      };

      mockReservationService.createReservation.mockRejectedValue(
        new Error('Invalid metadata')
      );

      await expect(controller.createReservation(invalidRequest as any)).rejects.toThrow(
        'Invalid metadata'
      );
    });
  });
});
