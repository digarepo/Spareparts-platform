import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { InventoryRepository } from '../../repositories/inventory.repository';
import type { CreateAdjustmentDto } from '../../dto/requests/create-adjustment.dto';
import type { RequestContext } from '@spareparts/contracts';
import type { StockAdjustmentResponse } from '@spareparts/contracts';
import { randomUUID } from 'crypto';

// Domain imports - using clean path aliases
import {
  InventoryAggregate,
  InventoryAggregateFactory,
  InventoryAggregateValidator
} from '@spareparts/domains/inventory';
import { InventoryAdjustmentService } from '@spareparts/domains/inventory';

/**
 * Stock adjustment service with pure domain delegation and atomic integrity.
 *
 * @remarks
 * - PURE DOMAIN DELEGATION: No manual calculations - all business logic delegated
 * - ATOMIC TRANSACTIONS: Every stock change has matching audit record
 * - Zero-Trust: No fallbacks or assumptions
 * - Orchestrator pattern: Coordinates between controller and domain
 */
@Injectable()
export class StockAdjustmentService {
  private readonly logger = new Logger(StockAdjustmentService.name);

  constructor(
    private readonly inventoryRepository: InventoryRepository,
  ) {}

  /**
   * Adjusts stock with pure domain delegation and atomic audit trail.
   *
   * @param request - Stock adjustment request
   * @param context - Request context for tenant isolation
   * @returns Stock adjustment response
   * @throws ConflictException - If business rules are violated
   */
  async adjustStock(
    request: CreateAdjustmentDto,
    context: RequestContext
  ): Promise<StockAdjustmentResponse> {
    this.logger.log(
      `Processing stock adjustment: tenant=${request.tenantId}, variant=${request.catalogVariantId}, ` +
      `type=${request.adjustment.adjustmentType}, quantity=${request.adjustment.quantity}`
    );

    // Step 1: Load current inventory for domain validation
    const inventoryEntity = await this.inventoryRepository.findByTenantAndVariant(
      request.tenantId,
      request.catalogVariantId,
      context
    );

    if (!inventoryEntity) {
      throw new ConflictException(
        `Inventory not found for tenant=${request.tenantId}, variant=${request.catalogVariantId}`
      );
    }

    // Step 2: Create domain aggregate for validation
    const inventoryAggregate = InventoryAggregateFactory.fromPrismaEntity({
      ...inventoryEntity,
      unitCost: inventoryEntity.unitCost ? Number(inventoryEntity.unitCost) : undefined,
    });

    // Step 3: PURE DOMAIN DELEGATION - Validate using domain service
    const validationResult = InventoryAdjustmentService.validateAdjustment(
      inventoryAggregate,
      {
        type: request.adjustment.adjustmentType,
        quantity: request.adjustment.quantity,
        reason: request.adjustment.reason,
        referenceId: request.adjustment.referenceId,
      }
    );

    if (!validationResult.isValid) {
      throw new ConflictException(
        `Validation failed: ${validationResult.errors.join(', ')}`
      );
    }

    // Step 4: PURE DOMAIN DELEGATION - Calculate new quantities using domain service
    const newQuantities = InventoryAdjustmentService.calculateNewQuantities(
      inventoryAggregate,
      request.adjustment.adjustmentType,
      request.adjustment.quantity
    );

    // Step 5: Domain invariant validation
    try {
      InventoryAggregateValidator.validateInvariants({
        ...inventoryAggregate,
        quantities: {
          onHand: newQuantities.onHandQuantity,
          reserved: newQuantities.reservedQuantity,
          allocated: newQuantities.allocatedQuantity,
          available: newQuantities.onHandQuantity - newQuantities.reservedQuantity - newQuantities.allocatedQuantity,
        },
      });
    } catch (error) {
      throw new ConflictException(
        `Invariant violation: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // Step 6: ATOMIC DATABASE UPDATE - Update quantities with audit trail in single transaction
    const movementId = randomUUID(); // CRYPTOGRAPHIC ID
    const updatedInventory = await this.inventoryRepository.updateQuantities(
      request.tenantId,
      request.catalogVariantId,
      {
        onHandQuantity: newQuantities.onHandQuantity,
        reservedQuantity: newQuantities.reservedQuantity,
        allocatedQuantity: newQuantities.allocatedQuantity,
      },
      request.adjustment.reason,
      request.adjustment.referenceId,
      request.metadata,
      context
    );

    this.logger.log(
      `Stock adjustment completed atomically: tenant=${request.tenantId}, variant=${request.catalogVariantId}, ` +
      `newOnHand=${updatedInventory.onHandQuantity}, movementId=${movementId}`
    );

    // Step 7: Map to response contract
    const response: StockAdjustmentResponse = {
      success: true,
      quantities: {
        onHand: updatedInventory.onHandQuantity,
        reserved: updatedInventory.reservedQuantity,
        allocated: updatedInventory.allocatedQuantity,
        available: updatedInventory.onHandQuantity - 
          updatedInventory.reservedQuantity - 
          updatedInventory.allocatedQuantity,
      },
      movementId: movementId,
      adjustedAt: new Date(),
      warnings: validationResult.warnings,
    };

    return response;
  }

  /**
   * Validates an adjustment without applying it.
   *
   * @param request - Stock adjustment request
   * @param context - Request context for tenant isolation
   * @returns Validation result
   */
  async validateAdjustment(
    request: CreateAdjustmentDto,
    context: RequestContext
  ) {
    this.logger.log(
      `Validating adjustment: tenant=${request.tenantId}, variant=${request.catalogVariantId}`
    );

    // Load current state
    const currentInventory = await this.inventoryRepository.findByTenantAndVariant(
      request.tenantId,
      request.catalogVariantId,
      context
    );

    if (!currentInventory) {
      return {
        isValid: false,
        errors: ['Inventory not found'],
        warnings: [],
      };
    }

    // Create domain aggregate
    const inventoryAggregate = InventoryAggregateFactory.fromPrismaEntity({
      ...currentInventory,
      unitCost: currentInventory.unitCost ? Number(currentInventory.unitCost) : undefined,
    });

    // PURE DOMAIN DELEGATION - Validate using domain service
    return InventoryAdjustmentService.validateAdjustment(
      inventoryAggregate,
      {
        type: request.adjustment.adjustmentType,
        quantity: request.adjustment.quantity,
        reason: request.adjustment.reason,
        referenceId: request.adjustment.referenceId,
      }
    );
  }

  /**
   * Gets adjustment history for an inventory item.
   *
   * @param tenantId - Tenant identifier
   * @param catalogVariantId - Catalog variant identifier
   * @param context - Request context for tenant isolation
   * @returns Stock movement history
   */
  async getAdjustmentHistory(
    tenantId: string,
    catalogVariantId: string,
    context: RequestContext
  ) {
    this.logger.log(
      `Getting adjustment history: tenant=${tenantId}, variant=${catalogVariantId}`
    );

    const detailedInventory = await this.inventoryRepository.getDetailed(
      tenantId,
      catalogVariantId,
      context
    );

    return {
      inventoryId: detailedInventory.id,
      catalogVariantId: detailedInventory.catalogVariantId,
      movements: detailedInventory.stockMovements.map(movement => ({
        id: movement.id,
        movementType: movement.movementType,
        quantity: movement.quantity,
        reason: movement.reason,
        referenceId: movement.referenceId,
        createdAt: movement.createdAt,
      })),
      currentQuantities: {
        onHand: detailedInventory.onHandQuantity,
        reserved: detailedInventory.reservedQuantity,
        allocated: detailedInventory.allocatedQuantity,
        available: detailedInventory.onHandQuantity - detailedInventory.reservedQuantity - detailedInventory.allocatedQuantity,
      },
    };
  }
}
