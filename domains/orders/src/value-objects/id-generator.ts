import { ulid } from 'ulid';

/**
 * Domain ID generator using ULID for global uniqueness and sortability.
 *
 * @remarks
 * - **Scope:** domain entity identification
 * - **Authority:** domain only; no persistence semantics
 * - **Invariants:** generates cryptographically secure, sortable IDs
 * - **Security:** prevents ID collisions under high load
 */
export class DomainIdGenerator {
  /**
   * Generates a new cart ID.
   *
   * @returns ULID-based cart identifier
   *
   * @remarks
   * - Uses ULID for sortability and uniqueness
   * - Cryptographically secure randomness
   * - Safe for high-concurrency environments
   */
  static generateCartId(): string {
    return ulid();
  }

  /**
   * Generates a new order ID.
   *
   * @returns ULID-based order identifier
   *
   * @remarks
   * - Uses ULID for sortability and uniqueness
   * - Enables chronological order listing
   * - Safe for distributed systems
   */
  static generateOrderId(): string {
    return ulid();
  }

  /**
   * Generates a new cart item ID.
   *
   * @returns ULID-based cart item identifier
   *
   * @remarks
   * - Uses ULID for sortability and uniqueness
   * - Prevents item ID collisions
   * - Maintains referential integrity
   */
  static generateCartItemId(): string {
    return ulid();
  }

  /**
   * Generates a new order item ID.
   *
   * @returns ULID-based order item identifier
   *
   * @remarks
   * - Uses ULID for sortability and uniqueness
   * - Enables audit trail chronology
   * - Safe for high-volume order processing
   */
  static generateOrderItemId(): string {
    return ulid();
  }

  /**
   * Validates ULID format.
   *
   * @param id - ID to validate
   * @returns True if valid ULID
   *
   * @remarks
   * - Ensures ID format compliance
   * - Prevents injection attacks
   * - Used in domain validation
   */
  static isValidULID(id: string): boolean {
    return /^[0-9A-HJKMNP-TV-z]{26}$/.test(id);
  }
}
