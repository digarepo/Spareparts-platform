import { z } from 'zod';
import {
  CartIdSchema,
  CartItemIdSchema,
  CheckoutCustomerIdSchema,
  CheckoutTenantIdSchema,
  CatalogVariantIdSchema,
  SessionIdSchema
} from './identifiers';
import {
  CartQuantitySchema,
  CurrencyAmountSchema,
  CartStatusCodeSchema
} from './value-objects';

/**
 * Cart item creation request schema.
 *
 * @remarks
 * - Adds items to customer cart with observed pricing
 * - Supports both customer and guest carts
 * - Captures pricing at time of addition (may become stale)
 * - This matches CartItemResponseSchema for API consistency
 * - Scope: cart management operations
 */
export const AddCartItemRequestSchema = z.object({
  cartId: CartIdSchema.optional(),
  customerId: CheckoutCustomerIdSchema.optional(),
  sessionId: SessionIdSchema.optional(),
  tenantId: CheckoutTenantIdSchema,
  catalogVariantId: CatalogVariantIdSchema,
  quantity: CartQuantitySchema,
  observedUnitPrice: CurrencyAmountSchema,
  productName: z.string().min(1),
  variantName: z.string().min(1),
}).refine(
  (data) => data.customerId || data.sessionId,
  {
    message: "Either customerId or sessionId must be provided",
    path: ["customerId"]
  }
);
export type AddCartItemRequest = z.infer<typeof AddCartItemRequestSchema>;

/**
 * Cart item response schema.
 *
 * @remarks
 * - Returns cart item details with current state
 * - Includes observed pricing at time of addition
 * - Structure now matches AddCartItemRequestSchema exactly
 * - Scope: cart query responses
 */
export const CartItemResponseSchema = z.object({
  id: CartItemIdSchema,
  cartId: CartIdSchema,
  tenantId: CheckoutTenantIdSchema,
  catalogVariantId: CatalogVariantIdSchema,
  quantity: CartQuantitySchema,
  observedUnitPrice: CurrencyAmountSchema,
  productName: z.string(),
  variantName: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type CartItemResponse = z.infer<typeof CartItemResponseSchema>;


/**
 * Cart creation request schema.
 *
 * @remarks
 * - Creates new cart for customer or guest
 * - Sets expiration for stale cart cleanup
 * - Supports guest to customer upgrade path
 * - Scope: cart initialization
 */
export const CreateCartRequestSchema = z.object({
  customerId: CheckoutCustomerIdSchema.optional(),
  sessionId: SessionIdSchema.optional(),
  expiresAt: z.date().optional(),
}).refine(
  (data) => data.customerId || data.sessionId,
  {
    message: "Either customerId or sessionId must be provided",
    path: ["customerId"]
  }
);
export type CreateCartRequest = z.infer<typeof CreateCartRequestSchema>;

/**
 * Cart response schema.
 *
 * @remarks
 * - Returns cart details with items and status
 * - Includes expiration timestamp for cleanup
 * - Scope: cart query responses
 */
export const CartResponseSchema = z.object({
  id: CartIdSchema,
  customerId: CheckoutCustomerIdSchema.optional(),
  sessionId: SessionIdSchema.optional(),
  statusId: CartStatusCodeSchema,
  statusLabel: z.string(),
  expiresAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  items: z.array(CartItemResponseSchema),
  totals: z.object({
    itemCount: z.number().int().min(0),
    subtotalAmount: CurrencyAmountSchema,
  }),
});
export type CartResponse = z.infer<typeof CartResponseSchema>;

/**
 * Cart status update request schema.
 *
 * @remarks
 * - Updates cart status with audit trail
 * - Used for cart lifecycle management
 * - Scope: cart status transitions
 */
export const UpdateCartStatusRequestSchema = z.object({
  cartId: CartIdSchema,
  statusId: CartStatusCodeSchema,
  metadata: z.record(z.string(), z.unknown()).optional(),
  initiatedBy: z.string(),
});
export type UpdateCartStatusRequest = z.infer<typeof UpdateCartStatusRequestSchema>;
