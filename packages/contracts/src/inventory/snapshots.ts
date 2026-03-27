import { z } from 'zod';
import {
  CatalogVariantIdSchema,
  InventoryTenantIdSchema
} from './identifiers';
import { InventoryQuantityBreakdownSchema } from './quantities';

/**
 * Inventory snapshot schema.
 *
 * @remarks
 * - Represents current state of inventory for a variant
 * - Includes all quantity breakdowns and metadata
 * - Used for queries and inventory state reporting
 */
export const InventorySnapshotSchema = z.object({
  id: z.ulid(),
  tenantId: InventoryTenantIdSchema,
  catalogVariantId: CatalogVariantIdSchema,
  quantities: InventoryQuantityBreakdownSchema,
  status: z.object({
    isActive: z.boolean(),
    isSellable: z.boolean(),
    lowStockThreshold: InventoryQuantityBreakdownSchema.shape.onHand.optional(),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
  metadata: z.object({
    location: z.string().optional(),
    source: z.string().optional(),
    unitCost: z.number().positive().optional(),
  }).optional(),
});
export type InventorySnapshot = z.infer<typeof InventorySnapshotSchema>;

/**
 * Inventory list query request schema.
 *
 * @remarks
 * - Queries inventory items for a tenant
 * - Supports filtering, sorting, and pagination
 * - Used for inventory management and reporting
 */
export const InventoryListRequestSchema = z.object({
  tenantId: InventoryTenantIdSchema,
  catalogVariantIds: z.array(CatalogVariantIdSchema).optional(),
  isActive: z.boolean().optional(),
  isSellable: z.boolean().optional(),
  lowStockOnly: z.boolean().optional(),
  search: z.string().optional(),
  pagination: z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
  }),
  sortBy: z.enum(['catalogVariantId', 'onHand', 'available', 'updatedAt']).default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
export type InventoryListRequest = z.infer<typeof InventoryListRequestSchema>;

/**
 * Inventory list query response schema.
 *
 * @remarks
 * - Returns paginated list of inventory snapshots
 * - Includes summary statistics
 * - Provides pagination controls
 */
export const InventoryListResponseSchema = z.object({
  inventory: z.array(InventorySnapshotSchema),
  summary: z.object({
    totalRecords: z.number().int(),
    totalOnHand: z.number().int(),
    totalAvailable: z.number().int(),
    lowStockCount: z.number().int(),
    sellableCount: z.number().int(),
  }),

  pagination: z.object({
    page: z.number().int(),
    limit: z.number().int(),
    total: z.number().int(),
    totalPages: z.number().int(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
});
export type InventoryListResponse = z.infer<typeof InventoryListResponseSchema>;

/**
 * Inventory detail query request schema.
 *
 * @remarks
 * - Queries detailed information for a specific variant
 * - Includes historical data and trends
 * - Used for detailed inventory analysis
 */
export const InventoryDetailRequestSchema = z.object({
  tenantId: InventoryTenantIdSchema,
  catalogVariantId: CatalogVariantIdSchema,
  includeHistory: z.boolean().default(false),
  historyDays: z.number().int().min(1).max(365).default(30),
});
export type InventoryDetailRequest = z.infer<typeof InventoryDetailRequestSchema>;

/**
 * Inventory detail query response schema.
 *
 * @remarks
 * - Returns detailed inventory information
 * - Includes historical trends if requested
 * - Provides comprehensive inventory analysis
 */
export const InventoryDetailResponseSchema = z.object({
  current: InventorySnapshotSchema,
  history: z.array(z.object({
    date: z.date(),
    onHand: z.number().int(),
    reserved: z.number().int(),
    allocated: z.number().int(),
    available: z.number().int(),
  })).optional(),
  recentActivity: z.object({
    stockMovements: z.number().int(),
    newReservations: z.number().int(),
    newAllocations: z.number().int(),
  }),
});
export type InventoryDetailResponse = z.infer<typeof InventoryDetailResponseSchema>;
