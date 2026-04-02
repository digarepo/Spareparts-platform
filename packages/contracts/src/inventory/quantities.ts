import { z } from 'zod';

/**
 * Inventory quantity value object.
 *
 * @remarks
 * - Represents discrete, non-negative inventory quantities
 * - Enforces integer-only values per blueprint requirements
 * - Used for all quantity calculations and validations
 */
export const InventoryQuantitySchema = z.number()
  .int('Quantity must be an integer')
  .min(0, 'Quantity cannot be negative')
  .max(2147483647, 'Quantity exceeds maximum integer value');
export type InventoryQuantity = z.infer<typeof InventoryQuantitySchema>;


/**
 * Inventory quantity breakdown.
 *
 * @remarks
 * - Represents the three core quantity states from blueprint
 * - onHand: Total physical stock controlled by tenant
 * - reserved: Temporarily claimed stock (reduces availability)
 * - allocated: Committed stock for fulfillment (reduces availability)
 * - available: Derived quantity (onHand - reserved - allocated)
 */
export const InventoryQuantityBreakdownSchema = z.object({
  onHand: InventoryQuantitySchema.default(0),
  reserved: InventoryQuantitySchema.default(0),
  allocated: InventoryQuantitySchema.default(0),
  available: InventoryQuantitySchema.default(0),
}).refine(
  (data) => data.reserved + data.allocated <= data.onHand,
  {
    message: 'Reserved and allocated quantities cannot exceed on-hand quantity',
    path: ['reserved'],
  }
);
export type InventoryQuantityBreakdown = z.infer<typeof InventoryQuantityBreakdownSchema>;


/**
 * Quantity adjustment operation.
 *
 * @remarks
 * - Represents changes to on-hand inventory quantities
 * - Supports increases, decreases, and adjustments
 * - Used for stock movements and corrections
 */
export const QuantityAdjustmentSchema = z.object({
  adjustmentType: z.enum(['increase', 'decrease', 'adjustment']),
  quantity: InventoryQuantitySchema,
  reason: z.string().min(1).max(500),
  referenceId: z.ulid().optional(),
});
export type QuantityAdjustment = z.infer<typeof QuantityAdjustmentSchema>;
