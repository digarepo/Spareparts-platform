/**
 * Checkout contracts public API.
 *
 * @remarks
 * - Exports all checkout-related schemas and types
 * - Provides single import point for checkout contracts
 * - Maintains semantic versioning compatibility
 * - Follows Phase 4 inventory contract patterns
 */
export * from './identifiers';
export * from './value-objects';
export * from './cart.schema';
export * from './order.schema';
export * from './events';
