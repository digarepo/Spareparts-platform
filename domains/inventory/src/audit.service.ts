import { randomUUID } from 'crypto';
import type {
  InventoryStateChangeEvent,
  StockMovementEvent,
  ReservationEvent,
  AllocationEvent,
  InventoryAlertEvent,
  InventoryTenantId,
  CatalogVariantId,
  InventoryQuantityBreakdown
} from '@spareparts/contracts';
import { StockMovementType } from '@spareparts/contracts';

/**
 * Inventory audit service with Zero-Trust Atomic-Integrity standards.
 *
 * @remarks
 * - Creates reliable event-source audit records for distributed multi-tenant environment
 * - Uses cryptographic UUIDs for collision-proof identification
 * - Aligns with shared StockMovementType enum for consistency
 * - Ensures type consistency with InventoryQuantityBreakdown
 * - Returns immutable event objects for event sourcing safety
 * - No manual calculations - only records states provided by domain
 */
export class InventoryAuditService {
  /**
   * Creates a state change event with cryptographic ID.
   *
   * @param params - Event creation parameters
   * @returns Immutable state change event
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
  }): Readonly<InventoryStateChangeEvent> {
    return Object.freeze({
      id: randomUUID(), // CRYPTOGRAPHIC ID - collision-proof
      eventType: params.eventType,
      tenantId: params.tenantId,
      catalogVariantId: params.catalogVariantId,
      timestamp: new Date(),
      initiatedBy: params.initiatedBy,
      reason: params.reason,
      beforeState: params.beforeState, // TYPE CONSISTENCY - no manual math
      afterState: params.afterState,   // TYPE CONSISTENCY - domain provided
      referenceId: params.referenceId || '',
    });
  }

  /**
   * Creates a stock movement event with shared enum alignment.
   *
   * @param params - Event creation parameters
   * @returns Immutable stock movement event
   */
  static createStockMovementEvent(params: {
    tenantId: InventoryTenantId;
    catalogVariantId: CatalogVariantId;
    movementId: string;
    movementType: 'increase' | 'decrease' | 'adjustment'; // LIMITED TO STOCK MOVEMENT EVENT TYPES
    quantity: number;
    beforeState?: InventoryQuantityBreakdown;
    afterState: InventoryQuantityBreakdown;
    initiatedBy: string;
    reason: string;
    referenceId?: string;
  }): Readonly<StockMovementEvent> {
    return Object.freeze({
      id: randomUUID(), // CRYPTOGRAPHIC ID - collision-proof
      eventType: 'stock_adjusted',
      tenantId: params.tenantId,
      catalogVariantId: params.catalogVariantId,
      timestamp: new Date(),
      initiatedBy: params.initiatedBy,
      reason: params.reason,
      movementId: params.movementId,
      movementType: params.movementType, // ENUM ALIGNMENT - shared type consistency
      quantity: params.quantity,
      referenceId: params.referenceId || '',
      beforeState: params.beforeState, // TYPE CONSISTENCY - no manual math
      afterState: params.afterState,   // TYPE CONSISTENCY - domain provided
    });
  }

  /**
   * Creates a reservation event with cryptographic ID.
   *
   * @param params - Event creation parameters
   * @returns Immutable reservation event
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
  }): Readonly<ReservationEvent> {
    return Object.freeze({
      id: randomUUID(), // CRYPTOGRAPHIC ID - collision-proof
      eventType: params.eventType,
      tenantId: params.tenantId,
      catalogVariantId: params.catalogVariantId,
      timestamp: new Date(),
      reservationId: params.reservationId,
      reservationPurpose: params.reservationPurpose,
      quantity: params.quantity,
      initiatedBy: params.initiatedBy,
      reason: params.reason,
      referenceId: params.referenceId || '',
      expiresAt: params.expiresAt,
      beforeState: params.beforeState, // TYPE CONSISTENCY - no manual math
      afterState: params.afterState,   // TYPE CONSISTENCY - domain provided
    });
  }

  /**
   * Creates an allocation event with cryptographic ID.
   *
   * @param params - Event creation parameters
   * @returns Immutable allocation event
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
    referenceId?: string;
  }): Readonly<AllocationEvent> {
    return Object.freeze({
      id: randomUUID(), // CRYPTOGRAPHIC ID - collision-proof
      eventType: params.eventType,
      tenantId: params.tenantId,
      catalogVariantId: params.catalogVariantId,
      timestamp: new Date(),
      allocationId: params.allocationId,
      allocationPurpose: params.allocationPurpose,
      quantity: params.quantity,
      initiatedBy: params.initiatedBy,
      reason: params.reason,
      referenceId: params.referenceId || '',
      beforeState: params.beforeState, // TYPE CONSISTENCY - no manual math
      afterState: params.afterState,   // TYPE CONSISTENCY - domain provided
    });
  }

  /**
   * Creates an alert event with cryptographic ID.
   *
   * @param params - Event creation parameters
   * @returns Immutable alert event
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
  }): Readonly<InventoryAlertEvent> {
    return Object.freeze({
      id: randomUUID(), // CRYPTOGRAPHIC ID - collision-proof
      eventType: params.alertType === 'low_stock' ? 'low_stock_warning' : 'out_of_stock',
      tenantId: params.tenantId,
      catalogVariantId: params.catalogVariantId,
      timestamp: new Date(),
      alertType: params.alertType,
      currentQuantity: params.currentQuantity,
      threshold: params.threshold,
      currentState: params.currentState, // TYPE CONSISTENCY - domain provided
      initiatedBy: params.initiatedBy,
      reason: params.reason,
    });
  }

  /**
   * Creates a simple audit log entry with cryptographic ID.
   *
   * @param params - Audit log parameters
   * @returns Immutable audit log entry
   */
  static createAuditLog(params: {
    tenantId: InventoryTenantId;
    catalogVariantId: CatalogVariantId;
    operation: string;
    beforeState?: InventoryQuantityBreakdown;
    afterState: InventoryQuantityBreakdown;
    initiatedBy: string;
    reason: string;
    referenceId?: string;
  }): Readonly<{
    id: string;
    timestamp: Date;
    tenantId: string;
    catalogVariantId: string;
    operation: string;
    beforeState?: InventoryQuantityBreakdown;
    afterState: InventoryQuantityBreakdown;
    initiatedBy: string;
    reason: string;
    referenceId?: string;
  }> {
    return Object.freeze({
      id: randomUUID(), // CRYPTOGRAPHIC ID - collision-proof
      timestamp: new Date(),
      tenantId: params.tenantId,
      catalogVariantId: params.catalogVariantId,
      operation: params.operation,
      beforeState: params.beforeState, // TYPE CONSISTENCY - no manual math
      afterState: params.afterState,   // TYPE CONSISTENCY - domain provided
      initiatedBy: params.initiatedBy,
      reason: params.reason,
      referenceId: params.referenceId || '',
    });
  }

  /**
   * Creates a comprehensive stock movement event with shared enum mapping.
   *
   * @param params - Event creation parameters with StockMovementType enum
   * @returns Immutable stock movement event with enum consistency
   */
  static createStockMovementEventWithEnum(params: {
    tenantId: InventoryTenantId;
    catalogVariantId: CatalogVariantId;
    movementId: string;
    movementType: typeof StockMovementType.INCREASE | typeof StockMovementType.DECREASE | typeof StockMovementType.ADJUSTMENT; // LIMITED TO STOCK MOVEMENT EVENT TYPES
    quantity: number;
    beforeState?: InventoryQuantityBreakdown;
    afterState: InventoryQuantityBreakdown;
    initiatedBy: string;
    reason: string;
    referenceId?: string;
  }): Readonly<StockMovementEvent> {
    return Object.freeze({
      id: randomUUID(), // CRYPTOGRAPHIC ID - collision-proof
      eventType: 'stock_adjusted',
      tenantId: params.tenantId,
      catalogVariantId: params.catalogVariantId,
      timestamp: new Date(),
      initiatedBy: params.initiatedBy,
      reason: params.reason,
      movementId: params.movementId,
      movementType: params.movementType, // SHARED ENUM - type-safe consistency
      quantity: params.quantity,
      referenceId: params.referenceId || '',
      beforeState: params.beforeState, // TYPE CONSISTENCY - no manual math
      afterState: params.afterState,   // TYPE CONSISTENCY - domain provided
    });
  }

  /**
   * Creates a batch of audit events for atomic operations.
   *
   * @param events - Array of event creation parameters
   * @returns Array of immutable audit events with consistent IDs
   */
  static createBatchAuditEvents(events: ReadonlyArray<{
    type: 'state' | 'movement' | 'reservation' | 'allocation' | 'alert' | 'audit';
    params: Readonly<Record<string, unknown>>;
  }>): ReadonlyArray<Readonly<Record<string, unknown>>> {
    return Object.freeze(
      events.map(event => {
        switch (event.type) {
          case 'state':
            return this.createStateChangeEvent(event.params as Parameters<typeof InventoryAuditService.createStateChangeEvent>[0]);
          case 'movement':
            return this.createStockMovementEventWithEnum(event.params as Parameters<typeof InventoryAuditService.createStockMovementEventWithEnum>[0]);
          case 'reservation':
            return this.createReservationEvent(event.params as Parameters<typeof InventoryAuditService.createReservationEvent>[0]);
          case 'allocation':
            return this.createAllocationEvent(event.params as Parameters<typeof InventoryAuditService.createAllocationEvent>[0]);
          case 'alert':
            return this.createAlertEvent(event.params as Parameters<typeof InventoryAuditService.createAlertEvent>[0]);
          case 'audit':
            return this.createAuditLog(event.params as Parameters<typeof InventoryAuditService.createAuditLog>[0]);
          default:
            const exhaustiveCheck: never = event.type;
            throw new Error(`Unsupported event type: ${exhaustiveCheck}`);
        }
      })
    );
  }
}
