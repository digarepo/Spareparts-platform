import { z } from 'zod';

/**
 * Shared quantity unit contracts.
 *
 * @remarks
 * - **Scope:** platform
 * - **Authority:** contracts only
 * - **Invariants:** nonnegative values; units are enumerable
 */
export const QuantityUnitSchema = z.enum(["EACH", "GRAM", "KILOGRAM", "ML", "L"]);
export type QuantityUnit = z.infer<typeof QuantityUnitSchema>;

export const QuantityValueSchema = z.number().nonnegative();
export type QuantityValue = z.infer<typeof QuantityValueSchema>;

export const QuantitySchema = z.object({
    unit: QuantityUnitSchema,
    value: QuantityValueSchema,
});
export type Quantity = z.infer<typeof QuantitySchema>;
