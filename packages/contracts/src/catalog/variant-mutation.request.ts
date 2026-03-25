import { z } from "zod";
import { ProductIdSchema, VariantIdSchema } from "./identifiers";
import type { ProductId, VariantId } from "./identifiers";
import { QuantitySchema, type Quantity } from "./quantity";

/**
 * Variant mutation request contracts.
 *
 * @remarks
 * - **Scope:** tenant
 * - **Authority:** contracts only; no persistence semantics
 * - **Invariants:** SKU is unique per tenant; variant identity is immutable
 */

/**
 * Validates a request to create a new variant.
 *
 * @param productId - Parent product identifier; required
 * @param sku - Stock keeping unit; unique per tenant
 * @param name - Human-readable variant name; required
 * @param description - Optional variant description
 * @param attributes - Key-value pairs defining variant characteristics
 * @param dimensions - Physical dimensions (optional)
 *
 * @throws ValidationError when SKU conflicts or required fields are missing
 */
export const VariantCreateRequestSchema = z.object({
  productId: ProductIdSchema,
  sku: z.string().min(1).max(100),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  attributes: z.record(z.string(), z.string()).optional(),
  dimensions: z
    .object({
      weight: QuantitySchema.optional(),
      length: QuantitySchema.optional(),
      width: QuantitySchema.optional(),
      height: QuantitySchema.optional(),
    })
    .optional(),
});
export type VariantCreateRequest = z.infer<typeof VariantCreateRequestSchema>;

/**
 * Validates a request to update an existing variant.
 *
 * @remarks
 * - productId is immutable; variant cannot change parent product
 * - SKU may be updated but must remain unique per tenant
 * - Attributes can be restructured but should preserve identity semantics
 *
 * @param sku - Updated SKU; must remain unique per tenant
 * @param name - Updated variant name
 * @param description - Updated description
 * @param attributes - Updated variant-defining attributes
 * @param dimensions - Updated physical dimensions
 */
export const VariantUpdateRequestSchema = z.object({
  sku: z.string().min(1).max(100).optional(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  attributes: z.record(z.string(), z.string()).optional(),
  dimensions: z
    .object({
      weight: QuantitySchema.optional(),
      length: QuantitySchema.optional(),
      width: QuantitySchema.optional(),
      height: QuantitySchema.optional(),
    })
    .optional(),
});
export type VariantUpdateRequest = z.infer<typeof VariantUpdateRequestSchema>;
