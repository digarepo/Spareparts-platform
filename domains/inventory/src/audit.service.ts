import type {
  InventoryEvent,
  InventoryStateChangeEvent,
  StockMovementEvent,
  ReservationEvent,
  AllocationEvent,
  InventoryAlertEvent,
  InventoryTenantId,
  CatalogVariantId,
  InventoryQuantityBreakdown
} from '@spareparts/contracts';
import { InventoryAggregate } from './inventory.aggregate';

/**
 * Inventory audit domain service.
 *
 * @remarks
 * - **Scope:** tenant
 * - **Authority:** audit trail and event generation
 * - **Invariants:** all mutations produce audit events
 * - **Semantics:** audit events are append-only and tamper-resistant
 */
export class InventoryAuditService {
  /**
   * Creates inventory state change event.
   *
   * @param params - Event creation parameters
   * @returns Inventory state change event
   */
  static createStateChangeEvent(params: {
    tenantId: InventoryTenantId;
    catalogVariantId: CatalogVariantId;
    eventType: 'inventory_created' | 'inventory_updated';
    beforeState?: InventoryQuantityBreakdown;
    afterState: InventoryQuantityBreakdown;
    initiatedBy: string;
    reason: string;
    referenceId?: string;
  }): InventoryStateChangeEvent {
    return {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      eventType: params.eventType,
      tenantId: params.tenantId,
      catalogVariantId: params.catalogVariantId,
      timestamp: new Date(),
      initiatedBy: params.initiatedBy,
      reason: params.reason,
      beforeState: params.beforeState,
      afterState: params.afterState,
      referenceId: params.referenceId,
    };
  }

  /**
   * Creates stock movement event.
   *
   * @param params - Event creation parameters
   * @returns Stock movement event
   */
  static createStockMovementEvent(params: {
    tenantId: InventoryTenantId;
    catalogVariantId: CatalogVariantId;
    movementId: string;
    movementType: 'increase' | 'decrease' | 'adjustment';
    quantity: number;
    beforeState?: InventoryQuantityBreakdown;
    afterState: InventoryQuantityBreakdown;
    initiatedBy: string;
    reason: string;
    referenceId?: string;
  }): StockMovementEvent {
    return {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      eventType: 'stock_adjusted',
      tenantId: params.tenantId,
      catalogVariantId: params.catalogVariantId,
      timestamp: new Date(),
      initiatedBy: params.initiatedBy,
      reason: params.reason,
      movementId: params.movementId,
      movementType: params.movementType,
      quantity: params.quantity,
      referenceId: params.referenceId,
      beforeState: params.beforeState,
      afterState: params.afterState,
    };
  }

  /**
   * Creates reservation event.
   *
   * @param params - Event creation parameters
   * @returns Reservation event
   */
  static createReservationEvent(params: {
    tenantId: InventoryTenantId;
    catalogVariantId: CatalogVariantId;
    reservationId: string;
    reservationPurpose: 'cart' | 'order' | 'manual' | 'system';
    quantity: number;
    eventType: 'reservation_created' | 'reservation_released' | 'reservation_expired';
    beforeState?: InventoryQuantityBreakdown;
    afterState: InventoryQuantityBreakdown;
    initiatedBy: string;
    reason: string;
    referenceId?: string;
    expiresAt?: Date;
  }): ReservationEvent {
    return {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      eventType: params.eventType,
      tenantId: params.tenantId,
      catalogVariantId: params.catalogVariantId,
      timestamp: new Date(),
      initiatedBy: params.initiatedBy,
      reason: params.reason,
      reservationId: params.reservationId,
      reservationPurpose: params.reservationPurpose,
      quantity: params.quantity,
      referenceId: params.referenceId,
      expiresAt: params.expiresAt,
      beforeState: params.beforeState,
      afterState: params.afterState,
    };
  }

  /**
   * Creates allocation event.
   *
   * @param params - Event creation parameters
   * @returns Allocation event
   */
  static createAllocationEvent(params: {
    tenantId: InventoryTenantId;
    catalogVariantId: CatalogVariantId;
    allocationId: string;
    allocationPurpose: 'order' | 'fulfillment';
    quantity: number;
    eventType: 'allocation_created' | 'allocation_reversed';
    beforeState?: InventoryQuantityBreakdown;
    afterState: InventoryQuantityBreakdown;
    initiatedBy: string;
    reason: string;
    referenceId: string;
  }): AllocationEvent {
    return {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      eventType: params.eventType,
      tenantId: params.tenantId,
      catalogVariantId: params.catalogVariantId,
      timestamp: new Date(),
      initiatedBy: params.initiatedBy,
      reason: params.reason,
      allocationId: params.allocationId,
      allocationPurpose: params.allocationPurpose,
      quantity: params.quantity,
      referenceId: params.referenceId,
      beforeState: params.beforeState,
      afterState: params.afterState,
    };
  }

  /**
   * Creates inventory alert event.
   *
   * @param params - Event creation parameters
   * @returns Inventory alert event
   */
  static createAlertEvent(params: {
    tenantId: InventoryTenantId;
    catalogVariantId: CatalogVariantId;
    alertType: 'low_stock' | 'out_of_stock';
    currentQuantity: number;
    threshold: number;
    currentState: InventoryQuantityBreakdown;
    initiatedBy: string;
    reason: string;
  }): InventoryAlertEvent {
    const eventType = params.alertType === 'low_stock' ? 'low_stock_warning' : 'out_of_stock';

    return {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      eventType,
      tenantId: params.tenantId,
      catalogVariantId: params.catalogVariantId,
      timestamp: new Date(),
      initiatedBy: params.initiatedBy,
      reason: params.reason,
      alertType: params.alertType,
      currentQuantity: params.currentQuantity,
      threshold: params.threshold,
      currentState: params.currentState,
    };
  }

  /**
   * Creates comprehensive audit trail for inventory operation.
   *
   * @param params - Audit trail parameters
   * @returns Array of audit events
   */
  static createAuditTrail(params: {
    operation: 'stock_adjustment' | 'reservation' | 'allocation' | 'creation' | 'update';
    tenantId: InventoryTenantId;
    catalogVariantId: CatalogVariantId;
    beforeState?: InventoryQuantityBreakdown;
    afterState: InventoryQuantityBreakdown;
    initiatedBy: string;
    reason: string;
    referenceId?: string;
    operationDetails?: {
      movementId?: string;
      movementType?: 'increase' | 'decrease' | 'adjustment';
      quantity?: number;
      reservationId?: string;
      reservationPurpose?: 'cart' | 'order' | 'manual' | 'system';
      allocationId?: string;
      allocationPurpose?: 'order' | 'fulfillment';
    };
  }): InventoryEvent[] {
    const events: InventoryEvent[] = [];

    switch (params.operation) {
      case 'stock_adjustment':
        if (params.operationDetails?.movementId && params.operationDetails?.movementType && params.operationDetails?.quantity) {
          const stockEvent = this.createStockMovementEvent({
            tenantId: params.tenantId,
            catalogVariantId: params.catalogVariantId,
            movementId: params.operationDetails.movementId,
            movementType: params.operationDetails.movementType,
            quantity: params.operationDetails.quantity,
            beforeState: params.beforeState,
            afterState: params.afterState,
            initiatedBy: params.initiatedBy,
            reason: params.reason,
            referenceId: params.referenceId,
          });
          events.push(stockEvent as InventoryEvent);
        }
        break;

      case 'reservation':
        if (params.operationDetails?.reservationId && params.operationDetails?.reservationPurpose && params.operationDetails?.quantity) {
          const eventType = this.determineReservationEventType(params.beforeState, params.afterState);
          const reservationEvent = this.createReservationEvent({
            tenantId: params.tenantId,
            catalogVariantId: params.catalogVariantId,
            reservationId: params.operationDetails.reservationId,
            reservationPurpose: params.operationDetails.reservationPurpose,
            quantity: params.operationDetails.quantity,
            eventType,
            beforeState: params.beforeState,
            afterState: params.afterState,
            initiatedBy: params.initiatedBy,
            reason: params.reason,
            referenceId: params.referenceId,
          });
          events.push(reservationEvent as InventoryEvent);
        }
        break;

      case 'allocation':
        if (params.operationDetails?.allocationId && params.operationDetails?.allocationPurpose && params.operationDetails?.quantity) {
          const eventType = this.determineAllocationEventType(params.beforeState, params.afterState);
          const allocationEvent = this.createAllocationEvent({
            tenantId: params.tenantId,
            catalogVariantId: params.catalogVariantId,
            allocationId: params.operationDetails.allocationId,
            allocationPurpose: params.operationDetails.allocationPurpose,
            quantity: params.operationDetails.quantity,
            eventType,
            beforeState: params.beforeState,
            afterState: params.afterState,
            initiatedBy: params.initiatedBy,
            reason: params.reason,
            referenceId: params.referenceId!,
          });
          events.push(allocationEvent as InventoryEvent);
        }
        break;

      case 'creation':
        const createEvent = this.createStateChangeEvent({
          tenantId: params.tenantId,
          catalogVariantId: params.catalogVariantId,
          eventType: 'inventory_created',
          afterState: params.afterState,
          initiatedBy: params.initiatedBy,
          reason: params.reason,
          referenceId: params.referenceId,
        });
        events.push(createEvent as InventoryEvent);
        break;

      case 'update':
        const updateEvent = this.createStateChangeEvent({
          tenantId: params.tenantId,
          catalogVariantId: params.catalogVariantId,
          eventType: 'inventory_updated',
          beforeState: params.beforeState,
          afterState: params.afterState,
          initiatedBy: params.initiatedBy,
          reason: params.reason,
          referenceId: params.referenceId,
        });
        events.push(updateEvent as InventoryEvent);
        break;
    }

    // Check for alert conditions
    const alertEvents = this.createAlertEventsIfNeeded({
      tenantId: params.tenantId,
      catalogVariantId: params.catalogVariantId,
      currentState: params.afterState,
      initiatedBy: params.initiatedBy,
      reason: params.reason,
    });

    events.push(...alertEvents.map(event => event as InventoryEvent));

    return events;
  }

  /**
   * Determines reservation event type based on state changes.
   *
   * @param beforeState - Previous state
   * @param afterState - New state
   * @returns Reservation event type
   */
  private static determineReservationEventType(
    beforeState?: InventoryQuantityBreakdown,
    afterState?: InventoryQuantityBreakdown
  ): 'reservation_created' | 'reservation_released' | 'reservation_expired' {
    if (!beforeState || !afterState) {
      return 'reservation_created';
    }

    if (afterState.reserved > beforeState.reserved) {
      return 'reservation_created';
    } else if (afterState.reserved < beforeState.reserved) {
      return 'reservation_released';
    }

    return 'reservation_created';
  }

  /**
   * Determines allocation event type based on state changes.
   *
   * @param beforeState - Previous state
   * @param afterState - New state
   * @returns Allocation event type
   */
  private static determineAllocationEventType(
    beforeState?: InventoryQuantityBreakdown,
    afterState?: InventoryQuantityBreakdown
  ): 'allocation_created' | 'allocation_reversed' {
    if (!beforeState || !afterState) {
      return 'allocation_created';
    }

    if (afterState.allocated > beforeState.allocated) {
      return 'allocation_created';
    } else if (afterState.allocated < beforeState.allocated) {
      return 'allocation_reversed';
    }

    return 'allocation_created';
  }

  /**
   * Creates alert events if conditions are met.
   *
   * @param params - Alert parameters
   * @returns Array of alert events
   */
  private static createAlertEventsIfNeeded(params: {
    tenantId: InventoryTenantId;
    catalogVariantId: CatalogVariantId;
    currentState: InventoryQuantityBreakdown;
    initiatedBy: string;
    reason: string;
  }): InventoryAlertEvent[] {
    const events: InventoryAlertEvent[] = [];

    // Check for out of stock
    if (params.currentState.available === 0) {
      events.push(this.createAlertEvent({
        tenantId: params.tenantId,
        catalogVariantId: params.catalogVariantId,
        alertType: 'out_of_stock',
        currentQuantity: params.currentState.available,
        threshold: 0,
        currentState: params.currentState,
        initiatedBy: params.initiatedBy,
        reason: params.reason,
      }));
    }

    // Check for low stock (threshold of 5 as default)
    const lowStockThreshold = 5;
    if (params.currentState.available > 0 && params.currentState.available <= lowStockThreshold) {
      events.push(this.createAlertEvent({
        tenantId: params.tenantId,
        catalogVariantId: params.catalogVariantId,
        alertType: 'low_stock',
        currentQuantity: params.currentState.available,
        threshold: lowStockThreshold,
        currentState: params.currentState,
        initiatedBy: params.initiatedBy,
        reason: params.reason,
      }));
    }

    return events;
  }

  /**
   * Validates audit event parameters.
   *
   * @param tenantId - Tenant ID
   * @param catalogVariantId - Catalog variant ID
   * @param initiatedBy - User or system initiating event
   * @param reason - Event reason
   * @throws Error - If parameters are invalid
   */
  static validateEventParameters(
    tenantId: InventoryTenantId,
    catalogVariantId: CatalogVariantId,
    initiatedBy: string,
    reason: string
  ): void {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    if (!catalogVariantId) {
      throw new Error('Catalog variant ID is required');
    }

    if (!initiatedBy) {
      throw new Error('Initiated by is required');
    }

    if (!reason || reason.trim().length === 0) {
      throw new Error('Reason is required');
    }

    if (reason.length > 500) {
      throw new Error('Reason too long');
    }
  }

  /**
   * Generates event ID for audit tracking.
   *
   * @returns Unique event identifier
   */
  static generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }

  /**
   * Creates event metadata for tracking.
   *
   * @param params - Metadata parameters
   * @returns Event metadata object
   */
  static createEventMetadata(params: {
    operation: string;
    system: string;
    version: string;
    additionalData?: Record<string, unknown>;
  }): Record<string, unknown> {
    return {
      operation: params.operation,
      system: params.system,
      version: params.version,
      timestamp: new Date().toISOString(),
      ...params.additionalData,
    };
  }
}
