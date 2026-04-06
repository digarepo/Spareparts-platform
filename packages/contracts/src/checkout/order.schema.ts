import { z } from 'zod';
import {
  OrderIdSchema,
  OrderItemIdSchema,
  CheckoutCustomerIdSchema,
  CheckoutTenantIdSchema,
  CatalogVariantIdSchema
} from './identifiers';
import {
  OrderQuantitySchema,
  CurrencyAmountSchema,
  OrderStatusCodeSchema,
  PricingMetadataSchema
} from './value-objects';
import { CartIdSchema } from './identifiers';

/**
 * Order item creation schema.
 *
 * @remarks
 * - Represents atomic unit of commitment in order
 * - Links to inventory reservation for stock locking
 * - Stores immutable pricing snapshot
 * - Scope: order composition
 */
export const OrderItemSchema = z.object({
  id: OrderItemIdSchema,
  orderId: OrderIdSchema,
  tenantId: CheckoutTenantIdSchema,
  catalogVariantId: CatalogVariantIdSchema,
  inventoryReservationId: z.string().optional(), // Phase 4 link
  quantity: OrderQuantitySchema,
  unitPrice: CurrencyAmountSchema, // Pricing snapshot
  totalPrice: CurrencyAmountSchema,
  productName: z.string(),
  variantName: z.string(),
  variantAttributes: z.record(z.string(), z.unknown()).optional(),
  pricingMetadata: PricingMetadataSchema,
  createdAt: z.date(),
});
export type OrderItem = z.infer<typeof OrderItemSchema>;

export const CreateOrderRequestSchema = z.object({
  cartId: CartIdSchema,
  customerId: CheckoutCustomerIdSchema,
  shippingAddress: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().optional(),
    subCity: z.string().optional(),
    woreda: z.string().optional(),
    country: z.string().min(2).max(2), // ISO 3166-1 alpha-2
  }),
  billingAddress: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().optional(),
    subCity: z.string().optional(),
    woreda: z.string().optional(),
    country: z.string().min(2).max(2), // ISO 3166-1 alpha-2
  }),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export type CreateOrderRequest = z.infer<typeof CreateOrderRequestSchema>;

/**
 * Order response schema.
 *
 * @remarks
 * - Returns order details with immutable line items
 * - Includes current status and audit trail
 * - Scope: order query responses
 */
export const OrderResponseSchema = z.object({
  id: OrderIdSchema,
  customerId: CheckoutCustomerIdSchema,
  statusId: OrderStatusCodeSchema,
  statusLabel: z.string(),
  items: z.array(OrderItemSchema),
  totals: z.object({
    subtotalAmount: CurrencyAmountSchema,
    taxAmount: CurrencyAmountSchema,
    shippingAmount: CurrencyAmountSchema,
    totalAmount: CurrencyAmountSchema,
  }),
  addresses: z.object({
    shipping: z.object({
      street: z.string(),
      city: z.string(),
      state: z.string(),
      postalCode: z.string().optional(),
      subCity: z.string().optional(),
      woreda: z.string().optional(),
      country: z.string(),
    }),
    billing: z.object({
      street: z.string(),
      city: z.string(),
      state: z.string(),
      postalCode: z.string().optional(),
      subCity: z.string().optional(),
      woreda: z.string().optional(),
      country: z.string(),
    }),
  }),
  timestamps: z.object({
    createdAt: z.date(),
    confirmedAt: z.date().optional(),
    shippedAt: z.date().optional(),
    completedAt: z.date().optional(),
    cancelledAt: z.date().optional(),
  }),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export type OrderResponse = z.infer<typeof OrderResponseSchema>;

/**
 * Order status update request schema.
 *
 * @remarks
 * - Updates order status with audit trail
 * - Follows state machine transition rules
 * - Scope: order lifecycle management
 */
export const UpdateOrderStatusRequestSchema = z.object({
  orderId: OrderIdSchema,
  statusId: OrderStatusCodeSchema,
  metadata: z.record(z.string(), z.unknown()).optional(),
  initiatedBy: z.string(),
  reason: z.string().optional(),
});
export type UpdateOrderStatusRequest = z.infer<typeof UpdateOrderStatusRequestSchema>;

/**
 * Order list query schema.
 *
 * @remarks
 * - Queries orders with pagination and filtering
 * - Customer-scoped access control
 * - Scope: order listing operations
 */
export const ListOrdersRequestSchema = z.object({
  customerId: CheckoutCustomerIdSchema,
  statusId: OrderStatusCodeSchema.optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});
export type ListOrdersRequest = z.infer<typeof ListOrdersRequestSchema>;

/**
 * Order list response schema.
 *
 * @remarks
 * - Returns paginated order list
 * - Includes pagination metadata
 * - Scope: order query responses
 */
export const ListOrdersResponseSchema = z.object({
  orders: z.array(OrderResponseSchema),
  pagination: z.object({
    page: z.number().int(),
    limit: z.number().int(),
    total: z.number().int(),
    totalPages: z.number().int(),
  }),
});
export type ListOrdersResponse = z.infer<typeof ListOrdersResponseSchema>;
