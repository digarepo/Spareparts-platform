import { z } from 'zod';

/**
 * Inventory item identifier.
 *
 * @remarks
 * - Represents a unique inventory record within tenant scope
 * - Combines tenant identity with catalog variant reference
 * - Used for all inventory operations and queries
 */
export const InventoryItemIdSchema = z.ulid();
export type InventoryItemId = z.infer<typeof InventoryItemIdSchema>;


/**
 * Inventory reservation identifier.
 *
 * @remarks
 * - Represents a temporary claim against available inventory
 * - Has finite lifetime and can be released or converted
 * - Used for cart reservations, order holds, etc.
 */
export const InventoryReservationIdSchema = z.ulid();
export type InventoryReservationId = z.infer<typeof InventoryReservationIdSchema>;


/**
 * Inventory allocation identifier.
 *
 * @remarks
 * - Represents a committed assignment of inventory to fulfillment
 * - Durable and not reversible without compensating action
 * - Used for order fulfillment, shipping allocations, etc.
 */
export const InventoryAllocationIdSchema = z.ulid();
export type InventoryAllocationId = z.infer<typeof InventoryAllocationIdSchema>;


/**
 * Stock movement identifier.
 *
 * @remarks
 * - Represents any change to on-hand inventory quantity
 * - Tracks increases, decreases, and adjustments
 * - Used for audit trail and reconciliation
 */
export const StockMovementIdSchema = z.ulid();
export type StockMovementId = z.infer<typeof StockMovementIdSchema>;


/**
 * Catalog variant identifier reference.
 *
 * @remarks
 * - Loose coupling reference to catalog domain
 * - No foreign key constraint - validated at application level
 * - Allows independent scaling and migration of catalog schema
 */
export const CatalogVariantIdSchema = z.ulid();
export type CatalogVariantId = z.infer<typeof CatalogVariantIdSchema>;


/**
 * Tenant identifier for inventory scoping.
 *
 * @remarks
 * - Ensures tenant isolation for all inventory operations
 * - Required for RLS policy enforcement
 * - Prevents cross-tenant data leakage
 */
export const InventoryTenantIdSchema = z.ulid();
export type InventoryTenantId = z.infer<typeof InventoryTenantIdSchema>;
