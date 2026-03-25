import { z } from "zod";

/**
 * Taxonomy contracts for hierarchical classification.
 *
 * @remarks
 * - **Scope:** platform
 * - **Authority:** contracts only; no persistence semantics
 * - **Invariants:** tree structure is acyclic; identifiers are opaque strings
 */

/**
 * Validates a taxonomy node identifier.
 *
 * @remarks
 * - Opaque ULID string
 * - No embedded hierarchy or meaning
 * - Globally unique across tenants
 */
export const TaxonomyIdSchema = z.ulid();
export type TaxonomyId = z.infer<typeof TaxonomyIdSchema>;

/**
 * Represents a single node in the taxonomy tree.
 *
 * @remarks
 * - Supports arbitrary depth via optional parentId
 * - Labels are human-readable; may be localized later
 * - Metadata is extensible for navigation facets
 *
 * @example
 * ```ts
 * const electronics: TaxonomyNode = {
 *   id: "01HXYKJ2R5E4X2Y3Z4A5B6C7D",
 *   parentId: null,
 *   label: "Electronics",
 *   metadata: { sortOrder: 10, facet: true }
 * };
 * ```
 */
export const TaxonomyNodeSchema = z.object({
    id: TaxonomyIdSchema,
    parentId: TaxonomyIdSchema.nullable(),
    label: z.string().min(1).max(255),
    metadata: z.record(z.string(), z.unknown().optional()),
    isPlatformOwned: z.boolean().optional(), // Platform-level taxonomy governance
});
export type TaxonomyNode = z.infer<typeof TaxonomyNodeSchema>;

/**
 * Represents a path from root to a specific taxonomy node.
 *
 * @remarks
 * - Ordered from ancestor to descendant
 * - Used for breadcrumb navigation and scoping queries
 */
export const TaxonomyPathSchema = z.array(TaxonomyNodeSchema);
export type TaxonomyPath = z.infer<typeof TaxonomyPathSchema>;
