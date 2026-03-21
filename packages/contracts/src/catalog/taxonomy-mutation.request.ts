import { z } from 'zod';
import { TaxonomyIdSchema, TaxonomyNodeSchema } from './taxonomy.schema';

/**
 * Taxonomy mutation request contracts.
 *
 * @remarks
 * - **Scope:** tenant
 * - **Authority:** request validation only
 * - **Invariants:** maintains tree structure integrity
 */

/**
 * Request schema for creating a new taxonomy node.
 *
 * @remarks
 * - ParentId must exist in tenant or be null for root nodes
 * - Label must be unique within parent scope
 * - Metadata is extensible for navigation facets
 *
 * @example
 * ```ts
 * const createRequest: TaxonomyCreateRequest = {
 *   parentId: null,
 *   label: "Electronics",
 *   metadata: { sortOrder: 10, facet: true }
 * };
 * ```
 */
export const TaxonomyCreateRequestSchema = z.object({
  parentId: TaxonomyIdSchema.nullable(),
  label: z.string().min(1).max(255),
  metadata: z.record(z.string(), z.unknown().optional()).optional(),
  isPlatformOwned: z.boolean().optional(), // Platform-level taxonomy governance
});
export type TaxonomyCreateRequest = z.infer<typeof TaxonomyCreateRequestSchema>;

/**
 * Request schema for updating an existing taxonomy node.
 *
 * @remarks
 * - Only provided fields are updated (partial update)
 * - ParentId changes are validated to prevent cycles
 * - Label changes validated for uniqueness within new parent scope
 *
 * @example
 * ```ts
 * const updateRequest: TaxonomyUpdateRequest = {
 *   label: "Consumer Electronics"
 * };
 * ```
 */
export const TaxonomyUpdateRequestSchema = z.object({
  parentId: TaxonomyIdSchema.nullable().optional(),
  label: z.string().min(1).max(255).optional(),
  metadata: z.record(z.string(), z.unknown().optional()).optional(),
  isPlatformOwned: z.boolean().optional(), // Platform-level taxonomy governance
});
export type TaxonomyUpdateRequest = z.infer<typeof TaxonomyUpdateRequestSchema>;

/**
 * Response schema for taxonomy operations.
 *
 * @remarks
 * - Returns complete node with system-generated fields
 * - Includes computed hierarchy information
 * - Metadata preserved from request or defaults
 */
export const TaxonomyResponseSchema = TaxonomyNodeSchema;
export type TaxonomyResponse = z.infer<typeof TaxonomyResponseSchema>;

/**
 * Response schema for taxonomy listing operations.
 *
 * @remarks
 * - Returns flat list of nodes for tenant
 * - Client-side responsible for tree construction
 * - Filtered by tenant context automatically
 */
export const TaxonomyListResponseSchema = z.object({
  taxonomies: z.array(TaxonomyResponseSchema),
  total: z.number(),
});
export type TaxonomyListResponse = z.infer<typeof TaxonomyListResponseSchema>;
