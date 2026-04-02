import { z } from 'zod';
import {
  CatalogVariantIdSchema,
  InventoryTenantIdSchema
} from './identifiers';
import {
    InventoryQuantitySchema,
    QuantityAdjustmentSchema
 } from './quantities';

/**
 * Stock adjustment request schema.
 *
 * @remarks
 * - Used for tenant-initiated inventory quantity changes
 * - Supports increases, decreases, and adjustments
 * - Requires explicit tenant context and reason
 */
export const StockAdjustmentRequestSchema = z.object({
  tenantId: InventoryTenantIdSchema,
  catalogVariantId: CatalogVariantIdSchema,
  adjustment: QuantityAdjustmentSchema,
  metadata: z.object({
    initiatedBy: z.string(),
    notes: z.string().max(1000).optional(),
    timestamp: z.date().optional(),
  }),
});
export type StockAdjustmentRequest = z.infer<typeof StockAdjustmentRequestSchema>;


/**
 * Stock adjustment response schema.
 *
 * @remarks
 * - Returns the updated inventory state after adjustment
 * - Includes all quantity breakdowns for verification
 * - Provides audit trail reference
 */
export const StockAdjustmentResponseSchema = z.object({
  success: z.boolean(),
  quantities: z.object({
    onHand: InventoryQuantitySchema,
    reserved: InventoryQuantitySchema,
    allocated: InventoryQuantitySchema,
    available: InventoryQuantitySchema,
  }),
  movementId: z.ulid(),
  adjustedAt: z.date(),
  warnings: z.array(z.string()).optional(),
});
export type StockAdjustmentResponse = z.infer<typeof StockAdjustmentResponseSchema>;

/**
 * Bulk stock adjustment request schema.
 *
 * @remarks
 * - Supports multiple adjustments in a single operation
 * - All adjustments succeed or fail together (atomic)
 * - Used for bulk inventory updates and corrections
 */
export const BulkStockAdjustmentRequestSchema = z.object({
  tenantId: InventoryTenantIdSchema,
  adjustments: z.array(StockAdjustmentRequestSchema.omit({ tenantId: true }))
    .min(1, 'At least one adjustment is required')
    .max(100, 'Cannot exceed 100 adjustments per request'),
  metadata: z.object({
    initiatedBy: z.string(),
    reason: z.string().min(1).max(500),
    referenceId: z.ulid().optional(),
  }),
});
export type BulkStockAdjustmentRequest = z.infer<typeof BulkStockAdjustmentRequestSchema>;

/**
 * Bulk stock adjustment response schema.
 *
 * @remarks
 * - Returns results for all adjustments in the batch
 * - Includes success/failure status for each item
 * - Provides overall operation status
 */
export const BulkStockAdjustmentResponseSchema = z.object({
  success: z.boolean(),
  results: z.array(z.object({
    catalogVariantId: CatalogVariantIdSchema,
    success: z.boolean(),
    quantities: z.object({
      onHand: InventoryQuantitySchema,
      reserved: InventoryQuantitySchema,
      allocated: InventoryQuantitySchema,
      available: InventoryQuantitySchema,
    }).optional(),
    movementId: z.ulid().optional(),
    error: z.string().optional(),
  })),
  completedAt: z.date(),
});
export type BulkStockAdjustmentResponse = z.infer<typeof BulkStockAdjustmentResponseSchema>;
