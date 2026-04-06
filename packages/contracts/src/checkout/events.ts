import { z } from 'zod';
import {
  CartIdSchema,
  OrderIdSchema,
  CheckoutCustomerIdSchema,
  CheckoutTenantIdSchema
} from './identifiers';
import { CartStatusCodeSchema, OrderStatusCodeSchema, CurrencyAmountSchema } from './value-objects';

/**
 * Checkout event type enumeration.
 *
 * @remarks
 * - Defines all possible checkout-related events
 * - Used for audit trail and event sourcing
 * - Supports domain event handling and monitoring
 */
export const CheckoutEventTypeSchema = z.enum([
  'cart_created',
  'cart_updated',
  'cart_item_added',
  'cart_item_removed',
  'cart_item_updated',
  'cart_expired',
  'cart_abandoned',
  'cart_converted',
  'order_created',
  'order_confirmed',
  'order_cancelled',
  'order_shipped',
  'order_completed',
  'order_failed',
  'checkout_started',
  'checkout_completed',
  'checkout_failed',
]);
export type CheckoutEventType = z.infer<typeof CheckoutEventTypeSchema>;

/**
 * Base checkout event schema.
 *
 * @remarks
 * - Common fields for all checkout events
 * - Provides audit trail and traceability
 * - Supports event sourcing and replay
 */
export const BaseCheckoutEventSchema = z.object({
  id: z.string(), // ULID
  eventType: CheckoutEventTypeSchema,
  timestamp: z.date(),
  customerId: CheckoutCustomerIdSchema.optional(),
  tenantId: CheckoutTenantIdSchema.optional(),
  initiatedBy: z.string(),
  correlationId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export type BaseCheckoutEvent = z.infer<typeof BaseCheckoutEventSchema>;

/**
 * Cart created event schema.
 *
 * @remarks
 * - Emitted when a new cart is created
 * - Includes cart initial state
 * - Scope: cart lifecycle events
 */
export const CartCreatedEventSchema = BaseCheckoutEventSchema.extend({
  eventType: z.literal('cart_created'),
  cartId: CartIdSchema,
  data: z.object({
    sessionId: z.string().optional(),
    expiresAt: z.date().optional(),
  }),
});
export type CartCreatedEvent = z.infer<typeof CartCreatedEventSchema>;

/**
 * Order created event schema.
 *
 * @remarks
 * - Emitted when an order is created from cart
 * - Includes order details and pricing snapshots
 * - FIXED: Uses CurrencyAmountSchema for precision consistency
 * - Scope: order lifecycle events
 */
export const OrderCreatedEventSchema = BaseCheckoutEventSchema.extend({
  eventType: z.literal('order_created'),
  orderId: OrderIdSchema,
  cartId: CartIdSchema,
  data: z.object({
    totalAmount: CurrencyAmountSchema,
    itemCount: z.number().int(),
    inventoryReservationIds: z.array(z.string()), // Phase 4 links
  }),
});
export type OrderCreatedEvent = z.infer<typeof OrderCreatedEventSchema>;

/**
 * Cart to order conversion event schema.
 *
 * @remarks
 * - Emitted when cart is successfully converted to order
 * - Marks cart as converted and creates order
 * - FIXED: Uses CurrencyAmountSchema for precision consistency
 * - Handles guest to customer upgrade path
 * - Scope: checkout process events
 */
export const CartConvertedEventSchema = BaseCheckoutEventSchema.extend({
  eventType: z.literal('cart_converted'),
  cartId: CartIdSchema,
  orderId: OrderIdSchema,
  data: z.object({
    conversionTimestamp: z.date(),
    itemCount: z.number().int(),
    totalAmount: CurrencyAmountSchema,
    upgradedFromGuestToCustomer: z.boolean().optional(), // Guest to customer upgrade tracking
  }),
});
export type CartConvertedEvent = z.infer<typeof CartConvertedEventSchema>;

/**
 * Order status changed event schema.
 *
 * @remarks
 * - Emitted when order status changes
 * - Includes before/after states for audit
 * - Scope: order state machine events
 */
export const OrderStatusChangedEventSchema = BaseCheckoutEventSchema.extend({
  eventType: z.enum(['order_confirmed', 'order_cancelled', 'order_shipped', 'order_completed', 'order_failed']),
  orderId: OrderIdSchema,
  data: z.object({
    previousStatusId: OrderStatusCodeSchema,
    newStatusId: OrderStatusCodeSchema,
    reason: z.string().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  }),
});
export type OrderStatusChangedEvent = z.infer<typeof OrderStatusChangedEventSchema>;

/**
 * Checkout event union type.
 *
 * @remarks
 * - Union of all checkout event types
 * - Used for event handling and processing
 * - Scope: checkout event system
 */
export const CheckoutEventSchema = z.discriminatedUnion('eventType', [
  CartCreatedEventSchema,
  OrderCreatedEventSchema,
  CartConvertedEventSchema,
  OrderStatusChangedEventSchema,
  // Add other event schemas as needed
]);
export type CheckoutEvent = z.infer<typeof CheckoutEventSchema>;
