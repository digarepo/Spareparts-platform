/**
 * Orders domain public API.
 *
 * @remarks
 * - Exports all orders domain services and aggregates
 * - Provides single import point for orders domain
 * - Maintains semantic versioning compatibility
 * - Follows production-grade DDD patterns
 */

// Value Objects
export * from './value-objects/order-status';
export * from './value-objects/cart-status';
export * from './value-objects/id-generator';
export * from './value-objects/price-freshness';

// Aggregates
export * from './cart.aggregate';
export * from './order.aggregate';

// Services
export * from './services/cart-order-conversion.service';
export * from './services/pricing-snapshot.service';
export * from './services/order-transition.service';
