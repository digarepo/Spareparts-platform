import { z } from 'zod';
import { ProductSlugSchema, ProductStatusSchema } from './product-state.schema';
import type { ProductSlug, ProductStatus } from './product-state.schema';

/**
 * Product mutation request contracts.
 *
 * @remarks
 * - **Scope:** tenant
 * - **Authority:** contracts only; no persistence semantics
 * - **Invariants:** slugs are unique per tenant; status transitions are validated elsewhere
 */

/**
 * Validates a request to create a new product.
 *
 * @param name - Human-readable product name; required
 * @param slug - URL-safe identifier; must be unique per tenant
 * @param description - Optional detailed description
 * @param status - Initial publication status; defaults to "draft"
 *
 * @throws ValidationError when required fields are missing or invalid
 */
export const ProductCreateRequestSchema = z.object({
    name: z.string().min(1).max(255),
    slug: ProductSlugSchema,
    description: z.string().max(2000).optional(),
    status: ProductStatusSchema.default("draft"),
});
export type ProductCreateRequest = z.infer<typeof ProductCreateRequestSchema>;

/**
 * Validates a request to update an existing product.
 *
 * @remarks
 * - All fields are optional; only provided fields are updated
 * - Slug changes may affect SEO/URLs; validation should enforce uniqueness
 * - Status transitions may be restricted by business rules
 *
 * @param name - Updated product name
 * @param slug - Updated slug; must remain unique per tenant
 * @param description - Updated description
 * @param status - Updated publication status
 */
export const ProductUpdateRequestSchema = z.object({
    name: z.string().min(1).max(255).optional(),
    slug: ProductSlugSchema.optional(),
    description: z.string().max(2000).optional(),
    status: ProductStatusSchema.optional(),
});
export type ProductUpdateRequest = z.infer<typeof ProductUpdateRequestSchema>;
