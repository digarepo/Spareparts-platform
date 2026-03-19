import { z } from 'zod';
import { PriceIdSchema, type PriceId } from './identifiers';

/**
 * Pricing contracts for products and variants.
 *
 * @remarks
 * - **Scope:** platform
 * - **Authority:** contracts only
 * - **Invariants:** amounts are nonnegative; currencies are ISO 4217
 */
export const MoneyValueSchema = z.object({
    amount: z.number().nonnegative(),
    currency: z.string().length(3),
});
export type MoneyValue = z.infer<typeof MoneyValueSchema>;

export const PriceSchema = z.object({
    id: PriceIdSchema,
    money: MoneyValueSchema,
});
export type Price = z.infer<typeof PriceSchema>;

export const CreatePriceRequestSchema = PriceSchema.omit({id: true});
export type CreatePriceRequest = z.infer<typeof CreatePriceRequestSchema>;
