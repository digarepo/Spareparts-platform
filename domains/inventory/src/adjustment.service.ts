import type {
  StockAdjustmentRequest,
  StockAdjustmentResponse,
  BulkStockAdjustmentRequest,
  BulkStockAdjustmentResponse,
  QuantityAdjustment,
  InventoryQuantityBreakdown,
  StockMovementId
} from '@spareparts/contracts';
import { InventoryAggregate, InventoryQuantityCalculator } from './inventory.aggregate';

/**
 * Inventory stock adjustment domain service.
 *
 * @remarks
 * - **Scope:** tenant
 * - **Authority:** governed inventory mutations
 * - **Invariants:** quantities remain non-negative, audit trail preserved
 * - **Semantics:** adjustments change on-hand quantity intentionally
 */
export class InventoryAdjustmentService {
  /**
   * Applies a stock adjustment to inventory.
   *
   * @param params - Adjustment parameters
   * @returns Adjustment result
   * @throws Error - If adjustment cannot be applied
   */
  static applyStockAdjustment(params: {
    request: StockAdjustmentRequest;
    inventory: InventoryAggregate;
  }): StockAdjustmentResponse {
    const { request, inventory } = params;

    if (request.tenantId !== inventory.tenantId) {
      throw new Error('Tenant scope mismatch');
    }

    if (request.catalogVariantId !== inventory.catalogVariantId) {
      throw new Error('Catalog variant ID mismatch');
    }

    const adjustmentAmount = this.calculateAdjustmentAmount(request.adjustment);

    if (!InventoryQuantityCalculator.canAdjustStock(inventory.quantities.onHand, adjustmentAmount)) {
      throw new Error('Stock adjustment would result in negative on-hand quantity');
    }

    const updatedQuantities = InventoryQuantityCalculator.applyStockAdjustment(
      inventory.quantities,
      adjustmentAmount
    );

    const movementId: StockMovementId = `mov_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

    return {
      success: true,
      quantities: updatedQuantities,
      movementId,
      adjustedAt: request.metadata.timestamp || new Date(),
    };
  }

  /**
   * Applies bulk stock adjustments.
   *
   * @param params - Bulk adjustment parameters
   * @returns Bulk adjustment result
   * @throws Error - If any adjustment cannot be applied
   */
  static applyBulkStockAdjustment(params: {
    request: BulkStockAdjustmentRequest;
    inventories: Map<string, InventoryAggregate>;
  }): BulkStockAdjustmentResponse {
    const { request, inventories } = params;
    const results = [];
    let hasFailure = false;

    for (const adjustment of request.adjustments) {
      const inventory = inventories.get(adjustment.catalogVariantId);

      if (!inventory) {
        results.push({
          catalogVariantId: adjustment.catalogVariantId,
          success: false,
          error: 'Inventory not found',
        });
        hasFailure = true;
        continue;
      }

      try {
        const result = this.applyStockAdjustment({
          request: {
            tenantId: request.tenantId,
            catalogVariantId: adjustment.catalogVariantId,
            adjustment: adjustment.adjustment,
            metadata: {
              initiatedBy: request.metadata.initiatedBy,
              notes: request.metadata.reason,
            },
          },
          inventory,
        });

        results.push({
          catalogVariantId: adjustment.catalogVariantId,
          success: true,
          quantities: result.quantities,
          movementId: result.movementId,
        });

        inventory.quantities = result.quantities;

      } catch (error) {
        results.push({
          catalogVariantId: adjustment.catalogVariantId,
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
   * Calculates adjustment amount based on type.
   *
   * @param adjustment - Quantity adjustment
   * @returns Numeric adjustment amount
   */
  private static calculateAdjustmentAmount(adjustment: QuantityAdjustment): number {
    switch (adjustment.adjustmentType) {
      case 'increase':
        return adjustment.quantity;
      case 'decrease':
        return -adjustment.quantity;
      case 'adjustment':
        return adjustment.quantity;
      default:
        throw new Error(`Unknown adjustment type: ${adjustment.adjustmentType}`);
    }
  }

  /**
   * Validates stock adjustment request.
   *
   * @param request - Adjustment request to validate
   * @throws Error - If request is invalid
   */
  static validateAdjustmentRequest(request: StockAdjustmentRequest): void {
    if (!request.tenantId) {
      throw new Error('Tenant ID is required');
    }

    if (!request.catalogVariantId) {
      throw new Error('Catalog variant ID is required');
    }

    if (!request.adjustment) {
      throw new Error('Adjustment details are required');
    }

    this.validateQuantityAdjustment(request.adjustment);

    if (!request.metadata?.initiatedBy) {
      throw new Error('Initiated by is required');
    }
  }

  /**
   * Validates bulk stock adjustment request.
   *
   * @param request - Bulk adjustment request to validate
   * @throws Error - If request is invalid
   */
  static validateBulkAdjustmentRequest(request: BulkStockAdjustmentRequest): void {
    if (!request.tenantId) {
      throw new Error('Tenant ID is required');
    }

    if (!request.adjustments || request.adjustments.length === 0) {
      throw new Error('At least one adjustment is required');
    }

    if (request.adjustments.length > 100) {
      throw new Error('Cannot exceed 100 adjustments per request');
    }

    for (const adjustment of request.adjustments) {
      this.validateQuantityAdjustment(adjustment.adjustment);
    }

    if (!request.metadata?.initiatedBy) {
      throw new Error('Initiated by is required');
    }

    if (!request.metadata?.reason) {
      throw new Error('Reason is required');
    }
  }

  /**
   * Validates quantity adjustment details.
   *
   * @param adjustment - Quantity adjustment to validate
   * @throws Error - If adjustment is invalid
   */
  private static validateQuantityAdjustment(adjustment: QuantityAdjustment): void {
    if (!adjustment.adjustmentType) {
      throw new Error('Adjustment type is required');
    }

    if (!['increase', 'decrease', 'adjustment'].includes(adjustment.adjustmentType)) {
      throw new Error('Invalid adjustment type');
    }

    if (adjustment.quantity <= 0) {
      throw new Error('Adjustment quantity must be positive');
    }

    if (!adjustment.reason) {
      throw new Error('Adjustment reason is required');
    }

    if (adjustment.reason.length > 500) {
      throw new Error('Adjustment reason too long');
    }
  }

  /**
   * Determines if adjustment requires approval.
   *
   * @param adjustment - Quantity adjustment
   * @returns Whether adjustment requires approval
   */
  static requiresApproval(adjustment: QuantityAdjustment): boolean {
    return adjustment.adjustmentType === 'decrease' && adjustment.quantity > 1000;
  }

  /**
   * Calculates adjustment impact on available quantity.
   *
   * @param currentQuantities - Current quantity breakdown
   * @param adjustment - Quantity adjustment
   * @returns Impact on available quantity
   */
  static calculateAvailableImpact(
    currentQuantities: InventoryQuantityBreakdown,
    adjustment: QuantityAdjustment
  ): number {
    const adjustmentAmount = this.calculateAdjustmentAmount(adjustment);
    return adjustmentAmount;
  }
}

/**
 * Stock movement validator.
 *
 * @remarks
 * - Validates stock movement business rules
 * - Ensures adjustment semantics are correct
 * - Provides detailed validation feedback
 */
export class StockMovementValidator {
  /**
   * Validates stock movement semantics.
   *
   * @param adjustment - Quantity adjustment
   * @param currentQuantities - Current inventory quantities
   * @throws Error - If movement violates business rules
   */
  static validateMovementSemantics(
    adjustment: QuantityAdjustment,
    currentQuantities: InventoryQuantityBreakdown
  ): void {
    switch (adjustment.adjustmentType) {
      case 'increase':
        this.validateIncrease(adjustment, currentQuantities);
        break;
      case 'decrease':
        this.validateDecrease(adjustment, currentQuantities);
        break;
      case 'adjustment':
        this.validateAdjustment(adjustment, currentQuantities);
        break;
    }
  }

  /**
   * Validates increase movement.
   *
   * @param adjustment - Quantity adjustment
   * @param currentQuantities - Current inventory quantities
   * @throws Error - If increase is invalid
   */
  private static validateIncrease(
    adjustment: QuantityAdjustment,
    currentQuantities: InventoryQuantityBreakdown
  ): void {
    if (adjustment.quantity <= 0) {
      throw new Error('Increase quantity must be positive');
    }

    if (adjustment.quantity > 100000) {
      throw new Error('Increase quantity exceeds reasonable limits');
    }
  }

  /**
   * Validates decrease movement.
   *
   * @param adjustment - Quantity adjustment
   * @param currentQuantities - Current inventory quantities
   * @throws Error - If decrease is invalid
   */
  private static validateDecrease(
    adjustment: QuantityAdjustment,
    currentQuantities: InventoryQuantityBreakdown
  ): void {
    if (adjustment.quantity <= 0) {
      throw new Error('Decrease quantity must be positive');
    }

    if (adjustment.quantity > currentQuantities.onHand) {
      throw new Error('Cannot decrease more than on-hand quantity');
    }

    if (adjustment.quantity > currentQuantities.available) {
      throw new Error('Cannot decrease below allocated + reserved quantities');
    }
  }

  /**
   * Validates adjustment movement.
   *
   * @param adjustment - Quantity adjustment
   * @param currentQuantities - Current inventory quantities
   * @throws Error - If adjustment is invalid
   */
  private static validateAdjustment(
    adjustment: QuantityAdjustment,
    currentQuantities: InventoryQuantityBreakdown
  ): void {
    const newOnHand = currentQuantities.onHand + adjustment.quantity;

    if (newOnHand < 0) {
      throw new Error('Adjustment would result in negative on-hand quantity');
    }

    if (newOnHand < currentQuantities.reserved + currentQuantities.allocated) {
      throw new Error('Adjustment would violate reservation and allocation commitments');
    }
  }
}
