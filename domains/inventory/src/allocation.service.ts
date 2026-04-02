import type {
  CreateAllocationRequest,
  CreateAllocationResponse,
  ReverseAllocationRequest,
  ReverseAllocationResponse,
  BulkCreateAllocationRequest,
  BulkCreateAllocationResponse,
  InventoryAllocationId,
  CatalogVariantId,
  InventoryTenantId,
  InventoryQuantityBreakdown
} from '@spareparts/contracts';
import { InventoryAggregate, InventoryQuantityCalculator } from './inventory.aggregate';

/**
 * Inventory allocation domain service.
 *
 * @remarks
 * - **Scope:** tenant
 * - **Authority:** committed inventory assignment
 * - **Invariants:** allocations are durable and reduce availability
 * - **Semantics:** allocations represent fulfillment commitments
 */
export class InventoryAllocationService {
  /**
   * Creates a new inventory allocation.
   *
   * @param params - Allocation creation parameters
   * @returns Allocation creation result
   * @throws Error - If allocation cannot be created
   */
  static createAllocation(params: {
    request: CreateAllocationRequest;
    inventory: InventoryAggregate;
  }): CreateAllocationResponse {
    const { request, inventory } = params;

    if (request.tenantId !== inventory.tenantId) {
      throw new Error('Tenant scope mismatch');
    }

    if (request.catalogVariantId !== inventory.catalogVariantId) {
      throw new Error('Catalog variant ID mismatch');
    }

    if (!InventoryQuantityCalculator.canAllocate(inventory.quantities, request.quantity)) {
      throw new Error('Insufficient available quantity for allocation');
    }

    const updatedQuantities = InventoryQuantityCalculator.applyAllocation(
      inventory.quantities,
      request.quantity
    );

    const allocationId: InventoryAllocationId = `alloc_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

    return {
      success: true,
      allocation: {
        id: allocationId,
        catalogVariantId: request.catalogVariantId,
        quantity: request.quantity,
        purpose: request.purpose,
        referenceId: request.referenceId,
        createdAt: new Date(),
      },
      quantities: updatedQuantities,
    };
  }

  /**
   * Reverses an existing inventory allocation.
   *
   * @param params - Allocation reversal parameters
   * @returns Allocation reversal result
   * @throws Error - If allocation cannot be reversed
   */
  static reverseAllocation(params: {
    request: ReverseAllocationRequest;
    inventory: InventoryAggregate;
    currentAllocationQuantity: number;
  }): ReverseAllocationResponse {
    const { request, inventory, currentAllocationQuantity } = params;

    if (request.tenantId !== inventory.tenantId) {
      throw new Error('Tenant scope mismatch');
    }

    if (currentAllocationQuantity <= 0) {
      throw new Error('No allocation quantity to reverse');
    }

    const updatedQuantities = InventoryQuantityCalculator.reverseAllocation(
      inventory.quantities,
      currentAllocationQuantity
    );

    return {
      success: true,
      allocation: {
        id: request.allocationId,
        catalogVariantId: inventory.catalogVariantId,
        quantity: currentAllocationQuantity,
        reversedAt: new Date(),
      },
      quantities: updatedQuantities,
    };
  }

  /**
   * Creates bulk inventory allocations.
   *
   * @param params - Bulk allocation parameters
   * @returns Bulk allocation result
   * @throws Error - If any allocation cannot be created
   */
  static createBulkAllocations(params: {
    request: BulkCreateAllocationRequest;
    inventories: Map<string, InventoryAggregate>;
  }): BulkCreateAllocationResponse {
    const { request, inventories } = params;
    const results = [];
    let hasFailure = false;

    for (const allocation of request.allocations) {
      const inventory = inventories.get(allocation.catalogVariantId);

      if (!inventory) {
        results.push({
          catalogVariantId: allocation.catalogVariantId,
          success: false,
          error: 'Inventory not found',
        });
        hasFailure = true;
        continue;
      }

      try {
        const result = this.createAllocation({
          request: {
            tenantId: request.tenantId,
            catalogVariantId: allocation.catalogVariantId,
            quantity: allocation.quantity,
            purpose: allocation.purpose,
            referenceId: allocation.referenceId,
            metadata: {
              initiatedBy: request.metadata.initiatedBy,
              notes: request.metadata.reason,
            },
          },
          inventory,
        });

        results.push({
          catalogVariantId: allocation.catalogVariantId,
          success: true,
          allocationId: result.allocation.id,
          quantities: result.quantities,
        });

        // Update inventory in map
        inventory.quantities = result.quantities;

      } catch (error) {
        results.push({
          catalogVariantId: allocation.catalogVariantId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        hasFailure = true;
      }
    }

    return {
      success: !hasFailure,
      results,
      completedAt: new Date(),
    };
  }

  /**
   * Validates allocation creation request.
   *
   * @param request - Allocation request to validate
   * @throws Error - If request is invalid
   */
  static validateAllocationRequest(request: CreateAllocationRequest): void {
    if (!request.tenantId) {
      throw new Error('Tenant ID is required');
    }

    if (!request.catalogVariantId) {
      throw new Error('Catalog variant ID is required');
    }

    if (request.quantity <= 0) {
      throw new Error('Allocation quantity must be positive');
    }

    if (!request.purpose) {
      throw new Error('Allocation purpose is required');
    }

    if (!['order', 'fulfillment'].includes(request.purpose)) {
      throw new Error('Invalid allocation purpose');
    }

    if (!request.referenceId) {
      throw new Error('Reference ID is required');
    }

    if (!request.metadata?.initiatedBy) {
      throw new Error('Initiated by is required');
    }
  }

  /**
   * Validates allocation reversal request.
   *
   * @param request - Reversal request to validate
   * @throws Error - If request is invalid
   */
  static validateReversalRequest(request: ReverseAllocationRequest): void {
    if (!request.tenantId) {
      throw new Error('Tenant ID is required');
    }

    if (!request.allocationId) {
      throw new Error('Allocation ID is required');
    }

    if (!request.metadata?.initiatedBy) {
      throw new Error('Initiated by is required');
    }

    if (!request.metadata?.reason) {
      throw new Error('Reversal reason is required');
    }

    if (!['cancelled', 'returned', 'correction', 'manual'].includes(request.metadata.reason)) {
      throw new Error('Invalid reversal reason');
    }
  }

  /**
   * Validates bulk allocation request.
   *
   * @param request - Bulk allocation request to validate
   * @throws Error - If request is invalid
   */
  static validateBulkAllocationRequest(request: BulkCreateAllocationRequest): void {
    if (!request.tenantId) {
      throw new Error('Tenant ID is required');
    }

    if (!request.allocations || request.allocations.length === 0) {
      throw new Error('At least one allocation is required');
    }

    if (request.allocations.length > 50) {
      throw new Error('Cannot exceed 50 allocations per request');
    }

    for (const allocation of request.allocations) {
      if (allocation.quantity <= 0) {
        throw new Error('Allocation quantity must be positive');
      }

      if (!['order', 'fulfillment'].includes(allocation.purpose)) {
        throw new Error('Invalid allocation purpose');
      }

      if (!allocation.referenceId) {
        throw new Error('Reference ID is required');
      }
    }

    if (!request.metadata?.initiatedBy) {
      throw new Error('Initiated by is required');
    }

    if (!request.metadata?.reason) {
      throw new Error('Reason is required');
    }
  }

  /**
   * Determines if allocation can be reversed.
   *
   * @param allocationPurpose - Original allocation purpose
   * @param reversalReason - Reason for reversal
   * @returns Whether reversal is allowed
   */
  static canReverseAllocation(allocationPurpose: string, reversalReason: string): boolean {
    const allowedReversals: Record<string, string[]> = {
      'order': ['cancelled', 'returned', 'correction', 'manual'],
      'fulfillment': ['returned', 'correction', 'manual'],
    };

    return allowedReversals[allocationPurpose]?.includes(reversalReason) || false;
  }

  /**
   * Calculates allocation efficiency.
   *
   * @param inventory - Inventory aggregate
   * @returns Allocation efficiency percentage
   */
  static calculateAllocationEfficiency(inventory: InventoryAggregate): number {
    if (inventory.quantities.onHand === 0) {
      return 0;
    }

    return (inventory.quantities.allocated / inventory.quantities.onHand) * 100;
  }

  /**
   * Checks if inventory is over-allocated.
   *
   * @param inventory - Inventory aggregate
   * @returns Whether inventory is over-allocated
   */
  static isOverAllocated(inventory: InventoryAggregate): boolean {
    return inventory.quantities.allocated > inventory.quantities.onHand;
  }
}

/**
 * Allocation policy validator.
 *
 * @remarks
 * - Validates allocation business policies
 * - Ensures allocation compliance
 * - Provides policy enforcement
 */
export class AllocationPolicyValidator {
  /**
   * Validates allocation against business policies.
   *
   * @param request - Allocation request
   * @param inventory - Current inventory state
   * @throws Error - If allocation violates policy
   */
  static validateAllocationPolicy(
    request: CreateAllocationRequest,
    inventory: InventoryAggregate
  ): void {
    this.validateAllocationLimits(request, inventory);
    this.validateBusinessRules(request, inventory);
    this.validateReferenceIntegrity(request);
  }

  /**
   * Validates allocation limits.
   *
   * @param request - Allocation request
   * @param inventory - Current inventory state
   * @throws Error - If limits are exceeded
   */
  private static validateAllocationLimits(
    request: CreateAllocationRequest,
    inventory: InventoryAggregate
  ): void {
    // Check if allocation would exceed available quantity
    if (request.quantity > inventory.quantities.available) {
      throw new Error('Allocation exceeds available quantity');
    }

    // Check for maximum allocation percentage (business rule)
    const maxAllocationPercentage = 0.95; // 95% of on-hand
    const maxAllowedAllocation = Math.floor(inventory.quantities.onHand * maxAllocationPercentage);

    if (inventory.quantities.allocated + request.quantity > maxAllowedAllocation) {
      throw new Error('Allocation would exceed maximum allocation percentage');
    }
  }

   /**
   * Validates business rules.
   *
   * @param request - Allocation request
   * @param inventory - Current inventory state
   * @throws Error - If business rules are violated
   */
  private static validateBusinessRules(
    request: CreateAllocationRequest,
    inventory: InventoryAggregate
  ): void {
    // Check if inventory is active
    if (!inventory.status.isActive) {
      throw new Error('Cannot allocate from inactive inventory');
    }

    // Check for low stock warnings and trigger notification
    if (inventory.status.lowStockThreshold) {
      const remainingAfterAllocation = inventory.quantities.available - request.quantity;
      if (remainingAfterAllocation < inventory.status.lowStockThreshold) {
        // Trigger low stock notification
        this.triggerLowStockNotification({
          tenantId: inventory.tenantId,
          catalogVariantId: inventory.catalogVariantId,
          currentQuantity: remainingAfterAllocation,
          threshold: inventory.status.lowStockThreshold,
          allocationQuantity: request.quantity,
          triggeredBy: request.metadata.initiatedBy,
        });
      }
    }
  }

  /**
   * Triggers low stock notification.
   *
   * @param params - Notification parameters
   */
  private static triggerLowStockNotification(params: {
    tenantId: InventoryTenantId;
    catalogVariantId: CatalogVariantId;
    currentQuantity: number;
    threshold: number;
    allocationQuantity: number;
    triggeredBy: string;
  }): void {
    // In a real implementation, this would integrate with a notification service
    // For now, we'll log the notification - in the API layer this would be handled
    console.warn('LOW STOCK NOTIFICATION:', {
      tenantId: params.tenantId,
      catalogVariantId: params.catalogVariantId,
      message: `Allocation of ${params.allocationQuantity} units will leave ${params.currentQuantity} units, below threshold of ${params.threshold}`,
      severity: 'warning',
      timestamp: new Date().toISOString(),
      triggeredBy: params.triggeredBy,
    });

    // This notification would be handled by the API layer's event publishing
    // The domain service's responsibility is to identify the need for notification
  }

  /**
   * Validates reference integrity.
   *
   * @param request - Allocation request
   * @throws Error - If reference is invalid
   */
  private static validateReferenceIntegrity(request: CreateAllocationRequest): void {
    if (request.purpose === 'order') {
      if (!request.referenceId.startsWith('order_')) {
        throw new Error('Invalid order reference ID format');
      }
    } else if (request.purpose === 'fulfillment') {
      if (!request.referenceId.startsWith('fulfill_')) {
        throw new Error('Invalid fulfillment reference ID format');
      }
    }
  }
}
