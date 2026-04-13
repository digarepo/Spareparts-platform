import { z } from 'zod';

/**
 * Currency amount with precision.
 *
 * @remarks
 * - Uses Decimal(12, 2) precision for currency
 * - Handles potentially large numbers in spare parts transactions
 * - Supports values up to 99,999,999,999.99 ETB
 * - String-coerced to prevent float precision errors
 * - Scope: checkout pricing and financial calculations
 */
export const CurrencyAmountSchema = z.string().regex(/^\d{1,11}(\.\d{1,2})?$/, {
    message: "Amount must be a valid decimal with maximum 2 decimal places and value <== 99,999,999,999.99"
}).transform((val) => {
    // ensure exactly 2 decimal places for db consistency
    const num = parseFloat(val);
    if(isNaN(num) || num < 0 || num > 99999999999.99) {
        throw new Error("Invalid currency amount");
    }
    return num.toFixed(2);
});
export type CurrencyAmount = z.infer<typeof CurrencyAmountSchema>;

/**
 * Order status code.
 *
 * @remarks
 * - String-based status codes per architectural rule (no enums)
 * - Supports future states without schema migrations
 * - Used for order state machine transitions
 * - Scope: order lifecycle management
 */
export const OrderStatusCodeSchema = z.string().min(1);
export type OrderStatusCode = z.infer<typeof OrderStatusCodeSchema>;

/**
 * Cart status code.
 *
 * @remarks
 * - String-based status codes per architectural rule (no enums)
 * - Supports future states without schema migrations
 * - Used for cart lifecycle management
 * - Scope: cart lifecycle management
 */
export const CartStatusCodeSchema = z.string().min(1);
export type CartStatusCode = z.infer<typeof CartStatusCodeSchema>;

/**
 * Order quantity.
 *
 * @remarks
 * - Whole, non-negative quantities for order items
 * - Represents committed purchase quantities
 * - Scope: order line item quantities
 */
export const OrderQuantitySchema = z.number().int().min(1);
export type OrderQuantity = z.infer<typeof OrderQuantitySchema>;

/**
 * Cart quantity.
 *
 * @remarks
 * - Whole, non-negative quantities for cart items
 * - Represents intended purchase quantities
 * - Scope: cart item quantities
 */
export const CartQuantitySchema = z.number().int().min(1);
export type CartQuantity = z.infer<typeof CartQuantitySchema>;

/**
 * Pricing snapshot metadata.
 *
 * @remarks
 * - Stores pricing context at moment of order creation
 * - Includes tax rates, discount information, etc.
 * - Immutable once captured for audit purposes
 * - Scope: order pricing audit trail
 */
export const PricingMetadataSchema = z.record(z.string(), z.unknown()).optional();
export type PricingMetadata = z.infer<typeof PricingMetadataSchema>;
