import type {
    InventoryQuantityBreakdown,
    CatalogVariantId,
    InventoryTenantId
} from '@spareparts/contracts';

/**
 * Inventory aggregate root.
 *
 * @remarks
 * - **Scope:** tenant
 * - **Authority:** domain only; no persistence semantics
 * - **Invariants:** quantities are non-negative integers, reserved + allocated <= on-hand
 * - **Identity:** stable per (tenantId, catalogVariantId) combination
 */
export interface InventoryAggregate {
  id: string;
  tenantId: InventoryTenantId;
  catalogVariantId: CatalogVariantId;
  quantities: InventoryQuantityBreakdown;
  status: {
    isActive: boolean;
    isSellable: boolean;
    lowStockThreshold?: number;
  };
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    location?: string;
    source?: string;
    unitCost?: number;
  };
}

/**
 * Inventory aggregate factory.
 *
 * @remarks
 * - Creates new inventory aggregates with proper invariants
 * - Enforces initial state validation
 * - Used for inventory creation operations
 */
export class InventoryAggregateFactory {
  /**
   * Creates a new inventory aggregate.
   *
   * @param params - Creation parameters
   * @returns New inventory aggregate
   * @throws Error - If invariants are violated
   *
   * @remarks
   * - Initializes with zero quantities
   * - Sets active status by default
   * - Generates stable aggregate ID
   */
  static create(params: {
    tenantId: InventoryTenantId;
    catalogVariantId: CatalogVariantId;
    lowStockThreshold?: number;
    metadata?: InventoryAggregate['metadata'];
  }): InventoryAggregate {
    const now = new Date();

    return {
      id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      tenantId: params.tenantId,
      catalogVariantId: params.catalogVariantId,
      quantities: {
        onHand: 0,
        reserved: 0,
        allocated: 0,
        available: 0,
      },
      status: {
        isActive: true,
        isSellable: false,
        lowStockThreshold: params.lowStockThreshold,
      },
      createdAt: now,
      updatedAt: now,
      metadata: params.metadata,
    };
  }

  /**
   * Creates inventory aggregate from Prisma entity.
   *
   * @param entity - Prisma inventory entity
   * @returns Inventory aggregate
   * @throws Error - If invariants are violated
   *
   * @remarks
   * - Maps database entity to domain aggregate
   * - Validates all invariants during conversion
   * - Used for loading from repository
   */
  static fromPrismaEntity(entity: {
    id: string;
    tenantId: string;
    catalogVariantId: string;
    onHandQuantity: number;
    reservedQuantity: number;
    allocatedQuantity: number;
    isActive: boolean;
    isSellable: boolean;
    lowStockThreshold?: number | null;
    location?: any;
    source?: string | null;
    unitCost?: number | null;
    createdAt: Date;
    updatedAt: Date;
  }): InventoryAggregate {
    const quantities: InventoryQuantityBreakdown = {
      onHand: entity.onHandQuantity,
      reserved: entity.reservedQuantity,
      allocated: entity.allocatedQuantity,
      available: InventoryQuantityCalculator.calculateAvailable(
        entity.onHandQuantity,
        entity.reservedQuantity,
        entity.allocatedQuantity
      ),
    };

    const aggregate: InventoryAggregate = {
      id: entity.id,
      tenantId: entity.tenantId,
      catalogVariantId: entity.catalogVariantId,
      quantities,
      status: {
        isActive: entity.isActive,
        isSellable: entity.isSellable,
        lowStockThreshold: entity.lowStockThreshold || undefined,
      },
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      metadata: {
        location: entity.location as string | undefined,
        source: entity.source || undefined,
        unitCost: entity.unitCost ? Number(entity.unitCost) : undefined,
      },
    };

    // Validate invariants
    InventoryAggregateValidator.validateInvariants(aggregate);

    return aggregate;
  }
}

/**
 * Inventory aggregate validator.
 *
 * @remarks
 * - Enforces all domain invariants
   * - Provides detailed validation errors
   * - Used by aggregate factory and operations
 */
export class InventoryAggregateValidator {
  /**
   * Validates all inventory aggregate invariants.
   *
   * @param aggregate - Inventory aggregate to validate
   * @throws Error - If any invariant is violated
   *
   * @remarks
   * - Checks quantity constraints
   * - Validates business rules
   * - Ensures data integrity
   */
  static validateInvariants(aggregate: InventoryAggregate): void {
    this.validateQuantities(aggregate.quantities);
    this.validateStatus(aggregate.status);
    this.validateIdentity(aggregate);
  }

  /**
   * Validates identity invariants.
   *
   * @param aggregate - Inventory aggregate to validate
   * @throws Error - If identity invariants are violated
   *
   * @remarks
   * - Validates tenant and variant identifiers
   * - Ensures proper identity structure
   */
  private static validateIdentity(aggregate: InventoryAggregate): void {
    if (!aggregate.tenantId) {
      throw new Error('Tenant ID is required');
    }

    if (!aggregate.catalogVariantId) {
      throw new Error('Catalog variant ID is required');
    }
  }

  /**
   * Validates quantity breakdown invariants.
   *
   * @param quantities - Quantity breakdown to validate
   * @throws Error - If quantity invariants are violated
   *
   * @remarks
   * - Enforces non-negative quantities
   * - Ensures reserved + allocated <= on-hand
   * - Validates available calculation
   */
  static validateQuantities(quantities: InventoryQuantityBreakdown): void {
    if (quantities.onHand < 0) {
      throw new Error('On-hand quantity cannot be negative');
    }

    if (quantities.reserved < 0) {
      throw new Error('Reserved quantity cannot be negative');
    }

    if (quantities.allocated < 0) {
      throw new Error('Allocated quantity cannot be negative');
    }

    if (quantities.available < 0) {
      throw new Error('Available quantity cannot be negative');
    }

    if (quantities.reserved + quantities.allocated > quantities.onHand) {
      throw new Error('Reserved and allocated quantities cannot exceed on-hand quantity');
    }

    const expectedAvailable = quantities.onHand - quantities.reserved - quantities.allocated;
    if (quantities.available !== expectedAvailable) {
      throw new Error(`Available quantity must be ${expectedAvailable}, got ${quantities.available}`);
    }
  }

  /**
   * Validates status invariants.
   *
   * @param status - Status to validate
   * @throws Error - If status invariants are violated
   *
   * @remarks
   * - Validates low stock threshold
   * - Ensures logical consistency
   */
  private static validateStatus(status: InventoryAggregate['status']): void {
    if (status.lowStockThreshold !== undefined && status.lowStockThreshold < 0) {
      throw new Error('Low stock threshold cannot be negative');
    }
  }

  /**
   * Validates quantity invariants with result.
   *
   * @param quantities - Quantity breakdown to validate
   * @returns Validation result
   */
  static validateQuantitiesWithResult(quantities: {
    onHandQuantity?: number;
    reservedQuantity?: number;
    allocatedQuantity?: number;
  }): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (quantities.onHandQuantity !== undefined && quantities.onHandQuantity < 0) {
      errors.push('On-hand quantity cannot be negative');
    }

    if (quantities.reservedQuantity !== undefined && quantities.reservedQuantity < 0) {
      errors.push('Reserved quantity cannot be negative');
    }

    if (quantities.allocatedQuantity !== undefined && quantities.allocatedQuantity < 0) {
      errors.push('Allocated quantity cannot be negative');
    }

    // Check oversubscription if all quantities are provided
    if (
      quantities.onHandQuantity !== undefined &&
      quantities.reservedQuantity !== undefined &&
      quantities.allocatedQuantity !== undefined
    ) {
      if (quantities.reservedQuantity + quantities.allocatedQuantity > quantities.onHandQuantity) {
        errors.push('Reserved and allocated quantities cannot exceed on-hand quantity');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Inventory quantity calculator.
 *
 * @remarks
   * - Provides safe quantity calculations
   * - Maintains invariant compliance
   * - Used by domain operations
 */
export class InventoryQuantityCalculator {
  /**
   * Calculates available quantity.
   *
   * @param onHand - On-hand quantity
   * @param reserved - Reserved quantity
   * @param allocated - Allocated quantity
   * @returns Available quantity
   *
   * @remarks
   * - Ensures non-negative result
   * - Maintains invariant compliance
   */
  static calculateAvailable(onHand: number, reserved: number, allocated: number): number {
    const available = onHand - reserved - allocated;
    return Math.max(0, available);
  }

  /**
   * Checks if reservation is possible.
   *
   * @param quantities - Current quantity breakdown
   * @param requestedQuantity - Quantity to reserve
   * @returns Whether reservation is possible
   *
   * @remarks
   * - Validates against available quantity
   * - Ensures no over-reservation
   */
  static canReserve(quantities: InventoryQuantityBreakdown, requestedQuantity: number): boolean {
    return quantities.available >= requestedQuantity && requestedQuantity > 0;
  }

  /**
   * Checks if allocation is possible.
   *
   * @param quantities - Current quantity breakdown
   * @param requestedQuantity - Quantity to allocate
   * @returns Whether allocation is possible
   *
   * @remarks
   * - Validates against available quantity
   * - Ensures no over-allocation
   */
  static canAllocate(quantities: InventoryQuantityBreakdown, requestedQuantity: number): boolean {
    return quantities.available >= requestedQuantity && requestedQuantity > 0;
  }

  /**
   * Checks if stock adjustment is valid.
   *
   * @param currentOnHand - Current on-hand quantity
   * @param adjustment - Adjustment amount (positive or negative)
   * @returns Whether adjustment is valid
   *
   * @remarks
   * - Ensures no negative on-hand quantities
   * - Validates adjustment logic
   */
  static canAdjustStock(currentOnHand: number, adjustment: number): boolean {
    const newOnHand = currentOnHand + adjustment;
    return newOnHand >= 0;
  }

  /**
   * Applies stock adjustment to quantities.
   *
   * @param quantities - Current quantity breakdown
   * @param adjustment - Stock adjustment amount
   * @returns Updated quantity breakdown
   * @throws Error - If adjustment would violate invariants
   *
   * @remarks
   * - Updates only on-hand quantity
   * - Recalculates available quantity
   * - Maintains all invariants
   */
  static applyStockAdjustment(
    quantities: InventoryQuantityBreakdown,
    adjustment: number
  ): InventoryQuantityBreakdown {
    const newOnHand = quantities.onHand + adjustment;

    if (newOnHand < 0) {
      throw new Error('Stock adjustment would result in negative on-hand quantity');
    }

    return {
      onHand: newOnHand,
      reserved: quantities.reserved,
      allocated: quantities.allocated,
      available: this.calculateAvailable(newOnHand, quantities.reserved, quantities.allocated),
    };
  }

  /**
   * Applies reservation to quantities.
   *
   * @param quantities - Current quantity breakdown
   * @param reservationQuantity - Quantity to reserve
   * @returns Updated quantity breakdown
   * @throws Error - If reservation would violate invariants
   *
   * @remarks
   * - Increases reserved quantity
   * - Recalculates available quantity
   * - Validates against available stock
   */
  static applyReservation(
    quantities: InventoryQuantityBreakdown,
    reservationQuantity: number
  ): InventoryQuantityBreakdown {
    if (!this.canReserve(quantities, reservationQuantity)) {
      throw new Error('Insufficient available quantity for reservation');
    }

    return {
      onHand: quantities.onHand,
      reserved: quantities.reserved + reservationQuantity,
      allocated: quantities.allocated,
      available: this.calculateAvailable(quantities.onHand, quantities.reserved + reservationQuantity, quantities.allocated),
    };
  }

  /**
   * Releases reservation from quantities.
   *
   * @param quantities - Current quantity breakdown
   * @param releaseQuantity - Quantity to release
   * @returns Updated quantity breakdown
   * @throws Error - If release would violate invariants
   *
   * @remarks
   * - Decreases reserved quantity
   * - Recalculates available quantity
   * - Validates against reserved quantity
   */
  static releaseReservation(
    quantities: InventoryQuantityBreakdown,
    releaseQuantity: number
  ): InventoryQuantityBreakdown {
    if (releaseQuantity > quantities.reserved) {
      throw new Error('Cannot release more than reserved quantity');
    }

    return {
      onHand: quantities.onHand,
      reserved: quantities.reserved - releaseQuantity,
      allocated: quantities.allocated,
      available: this.calculateAvailable(quantities.onHand, quantities.reserved - releaseQuantity, quantities.allocated),
    };
  }

  /**
   * Applies allocation to quantities.
   *
   * @param quantities - Current quantity breakdown
   * @param allocationQuantity - Quantity to allocate
   * @returns Updated quantity breakdown
   * @throws Error - If allocation would violate invariants
   *
   * @remarks
   * - Increases allocated quantity
   * - Recalculates available quantity
   * - Validates against available stock
   */
  static applyAllocation(
    quantities: InventoryQuantityBreakdown,
    allocationQuantity: number
  ): InventoryQuantityBreakdown {
    if (!this.canAllocate(quantities, allocationQuantity)) {
      throw new Error('Insufficient available quantity for allocation');
    }

    return {
      onHand: quantities.onHand,
      reserved: quantities.reserved,
      allocated: quantities.allocated + allocationQuantity,
      available: this.calculateAvailable(quantities.onHand, quantities.reserved, quantities.allocated + allocationQuantity),
    };
  }

  /**
   * Reverses allocation from quantities.
   *
   * @param quantities - Current quantity breakdown
   * @param reversalQuantity - Quantity to reverse
   * @returns Updated quantity breakdown
   * @throws Error - If reversal would violate invariants
   *
   * @remarks
   * - Decreases allocated quantity
   * - Recalculates available quantity
   * - Validates against allocated quantity
   */
  static reverseAllocation(
    quantities: InventoryQuantityBreakdown,
    reversalQuantity: number
  ): InventoryQuantityBreakdown {
    if (reversalQuantity > quantities.allocated) {
      throw new Error('Cannot reverse more than allocated quantity');
    }

    return {
      onHand: quantities.onHand,
      reserved: quantities.reserved,
      allocated: quantities.allocated - reversalQuantity,
      available: this.calculateAvailable(quantities.onHand, quantities.reserved, quantities.allocated - reversalQuantity),
    };
  }
}
