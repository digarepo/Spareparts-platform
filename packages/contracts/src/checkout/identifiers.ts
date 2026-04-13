import { z } from 'zod';
import { ULIDSchema, CustomerIdSchema, TenantIdSchema } from '../ids';

/**
 * Cart identifier
 *
 * @remarks
 * - Represents a unique cart within customer scope
 * - Used for all cart operations and customer sessions
 * - ULID ensures sortability and global uniqueness
 */
export const CartIdSchema = ULIDSchema;
export type CartId = z.infer<typeof CartIdSchema>;

/**
 * Order identifier
 *
 * @remarks
 * - Represents a unique order within platform scope
 * - Used for all order operations and audit trails
 * - ULID ensures sortability and golobal uniqueness
 */
export const OrderIdSchema = ULIDSchema;
export type OrderId = z.infer<typeof OrderIdSchema>;

/**
 * Order item identifier
 *
 * @remarks
 * - Represents a unique line item within an order
 * - Used for order composition and audit trails
 * - ULID ensures sortability and global uniqueness
 */
export const OrderItemIdSchema = ULIDSchema;
export type OrderItemId = z.infer<typeof OrderItemIdSchema>;

/**
 * Cart item identifier.
 *
 * @remarks
 * - Represents a unique item within a cart
 * - Used for cart composition and management
 * - ULID ensures sortability and global uniqueness
 */
export const CartItemIdSchema = ULIDSchema;
export type CartItemId = z.infer<typeof CartItemIdSchema>;

/**
 * Catalog variant identifier reference.
 *
 * @remarks
 * - Loose coupling reference to catalog domain
 * - No foreign key constraint - validated at application level
 * - Allows independent scaling and migration of catalog schema
 */
export const CatalogVariantIdSchema = ULIDSchema;
export type CatalogVariantId = z.infer<typeof CatalogVariantIdSchema>;

/**
 * Session identifier for guest carts.
 *
 * @remarks
 * - Used for anonymous cart tracking
 * - Temporary identifier that can be upgraded to customer cart
 * - ULID ensures sortability and global uniqueness
 */
export const SessionIdSchema = ULIDSchema;
export type SessionId = z.infer<typeof SessionIdSchema>;

/**
 * Tenant identifier for checkout scoping.
 *
 * @remarks
 * - Ensures tenant isolation for all checkout operations
 * - Required for RLS policy enforcement
 * - Prevents cross-tenant data leakage
 */
export const CheckoutTenantIdSchema = TenantIdSchema;
export type CheckoutTenantId = z.infer<typeof CheckoutTenantIdSchema>;

/**
 * Customer identifier for checkout ownership.
 *
 * @remarks
 * - Ensures customer ownership of carts and orders
 * - Used for customer-scoped access control
 * - Required for RLS policy enforcement
 */
export const CheckoutCustomerIdSchema = CustomerIdSchema;
export type CheckoutCustomerId = z.infer<typeof CheckoutCustomerIdSchema>;
