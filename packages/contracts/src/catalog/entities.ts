import { z } from 'zod';
import { ProductIdSchema, VariantIdSchema, type ProductId, type VariantId } from './identifiers';
import { QuantitySchema, type Quantity } from './quantity';
import { PriceSchema, type Price } from './pricing';

/**
 * Core catalog entity contracts.
 *
 * @remarks
 * - **Scope:** platform
 * - **Authority:** contracts only
 * - **Invariants:** names are non-empty; descriptions are bounded
 */
export const ProductSchema = z.object({
    id: ProductIdSchema,
    name: z.string().min(1).max(255),
    description: z.string().max(1000).optional(),
    //future: status, tags, etc...
});
export type Product = z.infer<typeof ProductSchema>;

export const VariantSchema = z.object({
    id: VariantIdSchema,
    productId: ProductIdSchema,
    sku: z.string().min(1).max(100),
    name: z.string().min(1).max(255),
    description: z.string().max(1000).optional(),
    //Future: attributes, images etc.
});
export type Variant = z.infer<typeof VariantSchema>;

export const VariantWithQuantitySchema = VariantSchema.extend({
    quantity: QuantitySchema.optional(),
});
export type VariantWithQuantity = z.infer<typeof VariantWithQuantitySchema>;

export const ProductWithVariantsSchema = ProductSchema.extend({
    variants: z.array(VariantWithQuantitySchema),
});
export type ProductWithVariants = z.infer<typeof ProductWithVariantsSchema>;

// Request/Responst TODOs
export const CreateProductRequestSchema = ProductSchema.omit({id: true});
export type CreateProductRequest = z.infer<typeof CreateProductRequestSchema>;

export const CreateVariantRequestSchema = VariantSchema.omit({id: true}).extend({
    price: PriceSchema.omit({id: true}),
});
export type CreateVariantRequest = z.infer<typeof CreateVariantRequestSchema>;

export const ProductResponseSchema = ProductSchema;
export type ProductResponse = z.infer<typeof ProductResponseSchema>;

export const ProductListResponseSchema = z.object({
    products: z.array(ProductResponseSchema),
});
export type ProductListResponse = z.infer<typeof ProductListResponseSchema>;
