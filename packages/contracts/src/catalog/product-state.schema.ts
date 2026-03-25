import { z } from 'zod';

/**
 * Product state and slug contracts.
 *
 * @remarks
 *  - **Scope:** platform
 *  - **Authority:** contracts only; no persistence semantics
 *  - **Invariants:** slugs are URL-safe and unique per tenant; statuses are explicit string codes
 */

/**
 * Validates a URL-safe product slug
 *
 * @remarks
 *  - Lowercase, hyphen-separated segments
 *  - Must start and end with alphanumeric
 *  - No consecutive hyphens or underscores
 *  - Maximum 100 characters
 */
export const ProductSlugSchema = z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format");
export type ProductSlug = z.infer<typeof ProductSlugSchema>;

/**
 * Represents product publication status.
 *
 * @remarks
 *  - **Draft:** Not visible publicly; editable
 *  - **Published:** Visible publicly; limited mutations
 *  - **Inactive:** Not visible; preserved for history
 *
 * These are descriptive codes only; behavior is enforced elsewhere.
 */
export const ProductStatusSchema = z.union([
    z.literal("draft"),
    z.literal("published"),
    z.literal("inactive"),
]);
export type ProductStatus = z.infer<typeof ProductStatusSchema>;
