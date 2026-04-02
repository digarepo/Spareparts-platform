/**
 * Inventory domain public API.
 *
 * @remarks
 * - Exports all inventory domain services and aggregates
 * - Provides single import point for inventory domain
 * - Maintains semantic versioning compatibility
 */
export * from './inventory.aggregate';
export * from './reservation.service';
export * from './adjustment.service';
export * from './allocation.service';
export * from './sellability.service';
export * from './audit.service';
