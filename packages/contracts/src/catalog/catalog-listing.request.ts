import { z } from "zod";
import { ProductStatusSchema } from "./product-state.schema";
import type { ProductStatus } from "./product-state.schema";
import { TaxonomyIdSchema } from "./taxonomy.schema";
import type { TaxonomyId } from "./taxonomy.schema";

/**
 * Catalog listing query contracts.
 *
 * @remarks
 * - **Scope:** tenant
 * - **Authority:** contracts only; no persistence semantics
 * - **Invariants:** pagination is bounded; filters are tenant-scoped
 */

/**
 * Validates pagination parameters for catalog listings.
 *
 * @remarks
 * - Zero-based page index; negative values clamp to 0
 * - Limit is bounded between 1 and 100 to prevent abuse
 * - Cursor-based pagination can be added later
 */
export const PaginationSchema = z.object({
  page: z.coerce.number().int().nonnegative().default(0),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type Pagination = z.infer<typeof PaginationSchema>;

/**
 * Validates filtering parameters for catalog listings.
 *
 * @remarks
 * - Status filter uses explicit string codes from ProductStatus
 * - Taxonomy filter restricts results to a category subtree
 * - Search term is optional; implementation may use full-text search
 *
 * @param status - Filter by product status; defaults to published
 * @param taxonomyId - Restrict to this category and its descendants
 * @param search - Free-text search term; optional
 */
export const CatalogFilterSchema = z.object({
  status: ProductStatusSchema.default("published"),
  taxonomyId: TaxonomyIdSchema.optional(),
  search: z.string().max(255).optional(),
});
export type CatalogFilter = z.infer<typeof CatalogFilterSchema>;

/**
 * Validates a complete catalog listing request.
 *
 * @remarks
 * - Combines pagination and filters
 * - Default behavior: published products, page 0, 20 items
 *
 * @example
 * ```ts
 * const query: CatalogListQuery = {
 *   pagination: { page: 1, limit: 10 },
 *   filter: { status: "published", taxonomyId: "01HXYKJ2R5E4X2Y3Z4A5B6C7D" }
 * };
 * ```
 */
export const CatalogListQuerySchema = z.object({
  pagination: PaginationSchema,
  filter: CatalogFilterSchema,
});
export type CatalogListQuery = z.infer<typeof CatalogListQuerySchema>;
