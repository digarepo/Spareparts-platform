import { z } from 'zod';

/**
 * Strongly typed identifiers for catalog entities.
 *
 * @remarks
 * - **Scope:** platform
 * - **Authority:** contracts only; no persistence semantics
 * - **Invariants:** opaque ULID strings, never null/undefined
 */
export const ProductIdSchema = z.ulid();
export type ProductId = z.infer<typeof ProductIdSchema>;

export const VariantIdSchema = z.ulid();
export type VariantId = z.infer<typeof VariantIdSchema>;

export const PriceIdSchema = z.ulid();
export type PriceId = z.infer<typeof PriceIdSchema>;

export const InventoryIdSchema = z.ulid();
export type InventoryId = z.infer<typeof InventoryIdSchema>;
