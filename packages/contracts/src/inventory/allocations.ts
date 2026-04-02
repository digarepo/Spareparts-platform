import { z } from 'zod';
import {
  CatalogVariantIdSchema,
  InventoryTenantIdSchema,
  InventoryAllocationIdSchema
} from './identifiers';
import { InventoryQuantitySchema } from './quantities';

/**
 * Allocation creation request schema.
 *
 * @remarks
 * - Creates committed assignments of inventory to fulfillment
 * - Reduces available quantity durably
 * - Used for order fulfillment and shipping
 */
export const CreateAllocationRequestSchema = z.object({
  tenantId: InventoryTenantIdSchema,
  catalogVariantId: CatalogVariantIdSchema,
  quantity: InventoryQuantitySchema,
  purpose: z.enum(['order', 'fulfillment']),
  referenceId: z.ulid(),
  metadata: z.object({
    initiatedBy: z.string(),
    notes: z.string().max(500).optional(),
  }),
});
export type CreateAllocationRequest = z.infer<typeof CreateAllocationRequestSchema>;

/**
 * Allocation creation response schema.
 *
 * @remarks
 * - Returns allocation details and updated inventory state
 * - Includes confirmation of committed inventory
 * - Provides audit trail reference
 */
export const CreateAllocationResponseSchema = z.object({
  success: z.boolean(),
  allocation: z.object({
    id: InventoryAllocationIdSchema,
    catalogVariantId: CatalogVariantIdSchema,
    quantity: InventoryQuantitySchema,
    purpose: z.string(),
    referenceId: z.ulid(),
    createdAt: z.date(),
  }),
  quantities: z.object({
    onHand: InventoryQuantitySchema,
    reserved: InventoryQuantitySchema,
    allocated: InventoryQuantitySchema,
    available: InventoryQuantitySchema,
  }),
  warnings: z.array(z.string()).optional(),
});
export type CreateAllocationResponse = z.infer<typeof CreateAllocationResponseSchema>;

/**
 * Allocation reversal request schema.
 *
 * @remarks
 * - Reverses previous allocations (compensating action)
 * - Returns inventory to available state
 * - Used for order cancellations and returns
 */
export const ReverseAllocationRequestSchema = z.object({
  tenantId: InventoryTenantIdSchema,
  allocationId: InventoryAllocationIdSchema,
  metadata: z.object({
    initiatedBy: z.string(),
    reason: z.enum(['cancelled', 'returned', 'correction', 'manual']),
    notes: z.string().max(500).optional(),
  }),
});
export type ReverseAllocationRequest = z.infer<typeof ReverseAllocationRequestSchema>;

/**
 * Allocation reversal response schema.
 *
 * @remarks
 * - Confirms successful allocation reversal
 * - Returns updated inventory quantities
 * - Provides audit trail information
 */
export const ReverseAllocationResponseSchema = z.object({
  success: z.boolean(),
  allocation: z.object({
    id: InventoryAllocationIdSchema,
    catalogVariantId: CatalogVariantIdSchema,
    quantity: InventoryQuantitySchema,
    reversedAt: z.date(),
  }),
  quantities: z.object({
    onHand: InventoryQuantitySchema,
    reserved: InventoryQuantitySchema,
    allocated: InventoryQuantitySchema,
    available: InventoryQuantitySchema,
  }),
  messages: z.array(z.string()).optional(),
});
export type ReverseAllocationResponse = z.infer<typeof ReverseAllocationResponseSchema>;

/**
 * Allocation query request schema.
 *
 * @remarks
 * - Queries existing allocations for tenant
 * - Supports filtering by variant, purpose, reference
 * - Includes pagination for large result sets
 */
export const QueryAllocationsRequestSchema = z.object({
  tenantId: InventoryTenantIdSchema,
  catalogVariantId: CatalogVariantIdSchema.optional(),
  purpose: z.enum(['order', 'fulfillment']).optional(),
  referenceId: z.ulid().optional(),
  dateRange: z.object({
    startDate: z.date(),
    endDate: z.date(),
  }).optional(),
  pagination: z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
  }),
  sortBy: z.enum(['createdAt', 'quantity', 'purpose']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
export type QueryAllocationsRequest = z.infer<typeof QueryAllocationsRequestSchema>;

/**
 * Allocation query response schema.
 *
 * @remarks
 * - Returns paginated list of allocations
 * - Includes total count for pagination controls
 * - Provides allocation details and status
 */
export const QueryAllocationsResponseSchema = z.object({
  allocations: z.array(z.object({
    id: InventoryAllocationIdSchema,
    catalogVariantId: CatalogVariantIdSchema,
    quantity: InventoryQuantitySchema,
    purpose: z.string(),
    referenceId: z.ulid(),
    createdAt: z.date(),
    reversedAt: z.date().nullable(),
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
export type QueryAllocationsResponse = z.infer<typeof QueryAllocationsResponseSchema>;

/**
 * Bulk allocation creation request schema.
 *
 * @remarks
 * - Creates multiple allocations in a single operation
 * - All allocations succeed or fail together (atomic)
 * - Used for complex order fulfillment scenarios
 */
export const BulkCreateAllocationRequestSchema = z.object({
  tenantId: InventoryTenantIdSchema,
  allocations: z.array(CreateAllocationRequestSchema.omit({ tenantId: true }))
    .min(1, 'At least one allocation is required')
    .max(50, 'Cannot exceed 50 allocations per request'),
  metadata: z.object({
    initiatedBy: z.string(),
    reason: z.string().min(1).max(500),
    referenceId: z.ulid().optional(),
  }),
});
export type BulkCreateAllocationRequest = z.infer<typeof BulkCreateAllocationRequestSchema>;

/**
 * Bulk allocation creation response schema.
 *
 * @remarks
 * - Returns results for all allocations in the batch
 * - Includes success/failure status for each item
 * - Provides overall operation status
 */
export const BulkCreateAllocationResponseSchema = z.object({
  success: z.boolean(),
  results: z.array(z.object({
    catalogVariantId: CatalogVariantIdSchema,
    success: z.boolean(),
    allocationId: InventoryAllocationIdSchema.optional(),
    quantities: z.object({
      onHand: InventoryQuantitySchema,
      reserved: InventoryQuantitySchema,
      allocated: InventoryQuantitySchema,
      available: InventoryQuantitySchema,
    }).optional(),
    error: z.string().optional(),
  })),
  completedAt: z.date(),
});
export type BulkCreateAllocationResponse = z.infer<typeof BulkCreateAllocationResponseSchema>;
