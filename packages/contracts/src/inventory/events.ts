import { z } from 'zod';
import {
  CatalogVariantIdSchema,
  InventoryTenantIdSchema,
  InventoryReservationIdSchema,
  InventoryAllocationIdSchema,
  StockMovementIdSchema
} from './identifiers';
import { InventoryQuantityBreakdownSchema } from './quantities';

/**
 * Inventory event type enumeration.
 *
 * @remarks
 * - Defines all possible inventory-related events
 * - Used for audit trail and event sourcing
 * - Supports domain event handling and monitoring
 */
export const InventoryEventTypeSchema = z.enum([
  'inventory_created',
  'inventory_updated',
  'stock_adjusted',
  'reservation_created',
  'reservation_released',
  'reservation_expired',
  'allocation_created',
  'allocation_reversed',
  'low_stock_warning',
  'out_of_stock',
]);

/**
 * Base inventory event schema.
 *
 * @remarks
 * - Common fields for all inventory events
 * - Provides audit trail and traceability
 * - Supports event sourcing and replay
 */
export const BaseInventoryEventSchema = z.object({
  id: z.ulid(),
  eventType: InventoryEventTypeSchema,
  tenantId: InventoryTenantIdSchema,
  catalogVariantId: CatalogVariantIdSchema,
  timestamp: z.date(),
  initiatedBy: z.string(),
  reason: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Inventory state change event schema.
 *
 * @remarks
 * - Captures before/after states for inventory mutations
 * - Used for audit trail and state reconstruction
 * - Supports change tracking and reconciliation
 */
export const InventoryStateChangeEventSchema = BaseInventoryEventSchema.extend({
  beforeState: InventoryQuantityBreakdownSchema.optional(),
  afterState: InventoryQuantityBreakdownSchema,
  referenceId: z.ulid().optional(),
});
export type InventoryStateChangeEvent = z.infer<typeof InventoryStateChangeEventSchema>;

/**
 * Stock movement event schema.
 *
 * @remarks
 * - Tracks all changes to on-hand inventory quantities
 * - Supports increase, decrease, and adjustment operations
 * - Used for inventory reconciliation and audit
 */
export const StockMovementEventSchema = BaseInventoryEventSchema.extend({
  movementId: StockMovementIdSchema,
  movementType: z.enum(['increase', 'decrease', 'adjustment']),
  quantity: z.number().int().min(0),
  referenceId: z.ulid().optional(),
  beforeState: InventoryQuantityBreakdownSchema.optional(),
  afterState: InventoryQuantityBreakdownSchema,
});
export type StockMovementEvent = z.infer<typeof StockMovementEventSchema>;

/**
 * Reservation lifecycle event schema.
 *
 * @remarks
 * - Tracks reservation creation, release, and expiration
 * - Supports cart and order reservation workflows
 * - Used for reservation analytics and monitoring
 */
export const ReservationEventSchema = BaseInventoryEventSchema.extend({
  reservationId: InventoryReservationIdSchema,
  reservationPurpose: z.enum(['cart', 'order', 'manual', 'system']),
  quantity: z.number().int().min(0),
  expiresAt: z.date().optional(),
  referenceId: z.ulid().optional(),
  beforeState: InventoryQuantityBreakdownSchema.optional(),
  afterState: InventoryQuantityBreakdownSchema,
});
export type ReservationEvent = z.infer<typeof ReservationEventSchema>;

/**
 * Allocation event schema.
 *
 * @remarks
 * - Tracks inventory allocation to fulfillment obligations
 * - Supports order fulfillment and shipping workflows
 * - Used for allocation tracking and analytics
 */
export const AllocationEventSchema = BaseInventoryEventSchema.extend({
  allocationId: InventoryAllocationIdSchema,
  allocationPurpose: z.enum(['order', 'fulfillment']),
  quantity: z.number().int().min(0),
  referenceId: z.ulid(),
  beforeState: InventoryQuantityBreakdownSchema.optional(),
  afterState: InventoryQuantityBreakdownSchema,
});
export type AllocationEvent = z.infer<typeof AllocationEventSchema>;

/**
 * Inventory alert event schema.
 *
 * @remarks
 * - Tracks low stock and out-of-stock alerts
 * - Supports inventory monitoring and notifications
 * - Used for supply chain and reorder triggers
 */
export const InventoryAlertEventSchema = BaseInventoryEventSchema.extend({
  alertType: z.enum(['low_stock', 'out_of_stock']),
  currentQuantity: z.number().int().min(0),
  threshold: z.number().int().min(0),
  currentState: InventoryQuantityBreakdownSchema,
});
export type InventoryAlertEvent = z.infer<typeof InventoryAlertEventSchema>;

/**
 * Unified inventory event schema.
 *
 * @remarks
 * - Discriminated union for all inventory event types
 * - Supports type-safe event handling
 * - Used for event processing and storage
 */
export const InventoryEventSchema = z.discriminatedUnion('eventType', [
  InventoryStateChangeEventSchema.extend({ eventType: z.literal('inventory_created') }),
  InventoryStateChangeEventSchema.extend({ eventType: z.literal('inventory_updated') }),
  StockMovementEventSchema.extend({ eventType: z.literal('stock_adjusted') }),
  ReservationEventSchema.extend({ eventType: z.literal('reservation_created') }),
  ReservationEventSchema.extend({ eventType: z.literal('reservation_released') }),
  ReservationEventSchema.extend({ eventType: z.literal('reservation_expired') }),
  AllocationEventSchema.extend({ eventType: z.literal('allocation_created') }),
  AllocationEventSchema.extend({ eventType: z.literal('allocation_reversed') }),
  InventoryAlertEventSchema.extend({ eventType: z.literal('low_stock_warning') }),
  InventoryAlertEventSchema.extend({ eventType: z.literal('out_of_stock') }),
]);
export type InventoryEvent = z.infer<typeof InventoryEventSchema>;

/**
 * Event query request schema.
 *
 * @remarks
 * - Queries inventory events for audit and analysis
 * - Supports filtering by type, date range, and entities
 * - Used for event history and troubleshooting
 */
export const EventQueryRequestSchema = z.object({
  tenantId: InventoryTenantIdSchema,
  catalogVariantId: CatalogVariantIdSchema.optional(),
  eventTypes: z.array(InventoryEventTypeSchema).optional(),
  dateRange: z.object({
    startDate: z.date(),
    endDate: z.date(),
  }).optional(),
  referenceId: z.ulid().optional(),
  pagination: z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(50),
  }),
  sortBy: z.enum(['timestamp', 'eventType']).default('timestamp'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
export type EventQueryRequest = z.infer<typeof EventQueryRequestSchema>;

/**
 * Event query response schema.
 *
 * @remarks
 * - Returns paginated list of inventory events
 * - Includes event details and pagination controls
 * - Used for audit trail and event history
 */
export const EventQueryResponseSchema = z.object({
  events: z.array(InventoryEventSchema),
  pagination: z.object({
    page: z.number().int(),
    limit: z.number().int(),
    total: z.number().int(),
    totalPages: z.number().int(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
});
export type EventQueryResponse = z.infer<typeof EventQueryResponseSchema>;
