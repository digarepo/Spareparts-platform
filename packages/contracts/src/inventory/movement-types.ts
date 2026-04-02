/**
 * Stock Movement Type enumeration.
 *
 * @remarks
 * - Defines all possible stock movement operations
 * - Used for consistency across inventory operations
 * - Supports analytics, reporting, and audit trail
 */
export const StockMovementType = {
  INCREASE: 'increase',
  DECREASE: 'decrease',
  ADJUSTMENT: 'adjustment',
  RESERVATION: 'reservation',
  RELEASE: 'release',
  ALLOCATION: 'allocation',
  DEALLOCATION: 'deallocation',
} as const;

/**
 * Stock Movement Type schema for validation.
 */
export const StockMovementTypeSchema = [
  StockMovementType.INCREASE,
  StockMovementType.DECREASE,
  StockMovementType.ADJUSTMENT,
  StockMovementType.RESERVATION,
  StockMovementType.RELEASE,
  StockMovementType.ALLOCATION,
  StockMovementType.DEALLOCATION,
] as const;

/**
 * Type inference for StockMovementType.
 */
export type StockMovementType = typeof StockMovementTypeSchema[number];
