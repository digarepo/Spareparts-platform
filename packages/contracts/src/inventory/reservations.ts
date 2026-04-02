import { z } from 'zod';
import {
  CatalogVariantIdSchema,
  InventoryTenantIdSchema,
  InventoryReservationIdSchema
} from './identifiers';
import { InventoryQuantitySchema } from './quantities';

/**
 * Reservation creation request schema.
 *
 * @remarks
 * - Creates temporary claims against available inventory
 * - Reduces available quantity but not on-hand quantity
 * - Supports cart reservations, order holds, manual holds
 */
export const CreateReservationRequestSchema = z.object({
  tenantId: InventoryTenantIdSchema,
  catalogVariantId: CatalogVariantIdSchema,
  quantity: InventoryQuantitySchema,
  purpose: z.enum(['cart', 'order', 'manual', 'system']),
  expiresAt: z.date().optional(),
  referenceId: z.ulid().optional(),
  metadata: z.object({
    initiatedBy: z.string(),
    notes: z.string().max(500).optional(),
  }),
});
export type CreateReservationRequest = z.infer<typeof CreateReservationRequestSchema>;

/**
 * Reservation creation response schema.
 *
 * @remarks
 * - Returns reservation details and updated inventory state
 * - Includes expiration timestamp for tracking
 * - Provides available quantity after reservation
 */
export const CreateReservationResponseSchema = z.object({
  success: z.boolean(),
  reservation: z.object({
    id: InventoryReservationIdSchema,
    catalogVariantId: CatalogVariantIdSchema,
    quantity: InventoryQuantitySchema,
    purpose: z.string(),
    expiresAt: z.date(),
    createdAt: z.date(),
    referenceId: z.ulid().optional(),
  }),
  quantities: z.object({
    onHand: InventoryQuantitySchema,
    reserved: InventoryQuantitySchema,
    allocated: InventoryQuantitySchema,
    available: InventoryQuantitySchema,
  }),
  warnings: z.array(z.string()).optional(),
});
export type CreateReservationResponse = z.infer<typeof CreateReservationResponseSchema>;

/**
 * Reservation release request schema.
 *
 * @remarks
 * - Releases temporary claims back to available inventory
 * - Can be explicit release or expiration cleanup
 * - Requires reservation ID and tenant context
 */
export const ReleaseReservationRequestSchema = z.object({
  tenantId: InventoryTenantIdSchema,
  reservationId: InventoryReservationIdSchema,
  metadata: z.object({
    initiatedBy: z.string(),
    reason: z.enum(['expired', 'cancelled', 'converted', 'manual']),
    notes: z.string().max(500).optional(),
  }),
});
export type ReleaseReservationRequest = z.infer<typeof ReleaseReservationRequestSchema>;

/**
 * Reservation release response schema.
 *
 * @remarks
 * - Confirms successful reservation release
 * - Returns updated inventory quantities
 * - Provides audit trail information
 */
export const ReleaseReservationResponseSchema = z.object({
  success: z.boolean(),
  reservation: z.object({
    id: InventoryReservationIdSchema,
    catalogVariantId: CatalogVariantIdSchema,
    quantity: InventoryQuantitySchema,
    releasedAt: z.date(),
  }),
  quantities: z.object({
    onHand: InventoryQuantitySchema,
    reserved: InventoryQuantitySchema,
    allocated: InventoryQuantitySchema,
    available: InventoryQuantitySchema,
  }),
  messages: z.array(z.string()).optional(),
});
export type ReleaseReservationResponse = z.infer<typeof ReleaseReservationResponseSchema>;

/**
 * Reservation query request schema.
 *
 * @remarks
 * - Queries existing reservations for tenant
 * - Supports filtering by variant, status, purpose
 * - Includes pagination for large result sets
 */
export const QueryReservationsRequestSchema = z.object({
  tenantId: InventoryTenantIdSchema,
  catalogVariantId: CatalogVariantIdSchema.optional(),
  purpose: z.enum(['cart', 'order', 'manual', 'system']).optional(),
  status: z.enum(['active', 'released', 'expired']).optional(),
  pagination: z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
  }),
  sortBy: z.enum(['createdAt', 'expiresAt', 'quantity']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
export type QueryReservationsRequest = z.infer<typeof QueryReservationsRequestSchema>;

/**
 * Reservation query response schema.
 *
 * @remarks
 * - Returns paginated list of reservations
 * - Includes total count for pagination controls
 * - Provides reservation details and status
 */
export const QueryReservationsResponseSchema = z.object({
  reservations: z.array(z.object({
    id: InventoryReservationIdSchema,
    catalogVariantId: CatalogVariantIdSchema,
    quantity: InventoryQuantitySchema,
    purpose: z.string(),
    status: z.enum(['active', 'released', 'expired']),
    createdAt: z.date(),
    expiresAt: z.date().nullable(),
    releasedAt: z.date().nullable(),
    referenceId: z.ulid().nullable(),
  })),
  pagination: z.object({
    page: z.number().int(),
    limit: z.number().int(),
    total: z.number().int(),
    totalPages: z.number().int(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
});
export type QueryReservationsResponse = z.infer<typeof QueryReservationsResponseSchema>;
