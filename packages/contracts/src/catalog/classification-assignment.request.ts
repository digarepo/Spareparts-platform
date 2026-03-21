import { z } from 'zod';
import { ProductIdSchema } from './identifiers';
import { TaxonomyIdSchema } from './taxonomy.schema';

/**
 * Classification assignment request contracts.
 *
 * @remarks
 * - **Scope:** tenant
 * - **Authority:** request validation only
 * - **Invariants:** maintains product-taxonomy relationship integrity
 */

/**
 * Request schema for assigning a product to a taxonomy node.
 *
 * @remarks
 * - Product must exist in tenant
 * - Taxonomy node must exist in tenant or be platform-defined
 * - Multiple assignments allowed for multi-category classification
 * - Assignment is explicit and auditable
 *
 * @example
 * ```ts
 * const assignRequest: ClassificationAssignRequest = {
 *   productId: "01HXYKJ2R5E4X2Y3Z4A5B6C7D",
 *   taxonomyId: "01HXYKJ2R5E4X2Y3Z4A5B6C7E"
 * };
 * ```
 */
export const ClassificationAssignRequestSchema = z.object({
  productId: ProductIdSchema,
  taxonomyId: TaxonomyIdSchema,
});
export type ClassificationAssignRequest = z.infer<typeof ClassificationAssignRequestSchema>;

/**
 * Request schema for unassigning a product from a taxonomy node.
 *
 * @remarks
 * - Must match existing assignment
 * - Historical audit trail preserved
 * - Cannot undo assignments that affect historical orders
 *
 * @example
 * ```ts
 * const unassignRequest: ClassificationUnassignRequest = {
 *   productId: "01HXYKJ2R5E4X2Y3Z4A5B6C7D",
 *   taxonomyId: "01HXYKJ2R5E4X2Y3Z4A5B6C7E"
 * };
 * ```
 */
export const ClassificationUnassignRequestSchema = z.object({
  productId: ProductIdSchema,
  taxonomyId: TaxonomyIdSchema,
});
export type ClassificationUnassignRequest = z.infer<typeof ClassificationUnassignRequestSchema>;

/**
 * Response schema for classification assignment operations.
 *
 * @remarks
 * - Returns the created assignment relationship
 * - Includes timestamps for audit trail
 * - Preserves historical context
 */
export const ClassificationAssignmentResponseSchema = z.object({
  id: z.string().ulid(),
  productId: ProductIdSchema,
  taxonomyId: TaxonomyIdSchema,
  tenantId: z.string(),
  assignedAt: z.date(),
  assignedBy: z.string(), // Actor ID
});
export type ClassificationAssignmentResponse = z.infer<typeof ClassificationAssignmentResponseSchema>;

/**
 * Response schema for listing product classifications.
 *
 * @remarks
 * - Returns all taxonomy assignments for a product
 * - Includes taxonomy node details for navigation
 * - Tenant-scoped automatically
 */
export const ClassificationListResponseSchema = z.object({
  assignments: z.array(ClassificationAssignmentResponseSchema),
  total: z.number(),
});
export type ClassificationListResponse = z.infer<typeof ClassificationListResponseSchema>;

/**
 * Request schema for bulk classification operations.
 *
 * @remarks
 * - Supports assigning multiple products to multiple categories
 * - Used for bulk import or reclassification operations
 * - All operations in single request are atomic
 */
export const ClassificationBulkAssignRequestSchema = z.object({
  assignments: z.array(ClassificationAssignRequestSchema),
});
export type ClassificationBulkAssignRequest = z.infer<typeof ClassificationBulkAssignRequestSchema>;

/**
 * Response schema for bulk classification operations.
 *
 * @remarks
 * - Returns results of each assignment operation
 * - Includes success/failure status per assignment
 * - Enables partial success handling
 */
export const ClassificationBulkAssignResponseSchema = z.object({
  results: z.array(z.object({
    request: ClassificationAssignRequestSchema,
    success: z.boolean(),
    assignment: ClassificationAssignmentResponseSchema.optional(),
    error: z.string().optional(),
  })),
  totalProcessed: z.number(),
  totalSucceeded: z.number(),
  totalFailed: z.number(),
});
export type ClassificationBulkAssignResponse = z.infer<typeof ClassificationBulkAssignResponseSchema>;
