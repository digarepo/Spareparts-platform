/**
 * Cart status value object with lifecycle validation.
 *
 * @remarks
 * - **Scope:** cart lifecycle management
 * - **Authority:** domain business rules only
 * - **Invariants:** cart status follows customer journey patterns
 * - **Security:** prevents invalid cart state manipulation
 */
export class CartStatus {
  private static readonly VALID_TRANSITIONS: Record<string, string[]> = {
    ACTIVE: ['ABANDONED', 'EXPIRED', 'CONVERTED'],
    ABANDONED: ['ACTIVE'], // Can be reactivated
    EXPIRED: ['ACTIVE'], // Can be reactivated
    CONVERTED: [], // Terminal state
  };

  private static readonly TERMINAL_STATES = new Set(['CONVERTED']);

  constructor(
    public readonly value: string,
    public readonly timestamp: Date = new Date()
  ) {
    this.validateStatusCode(value);
  }

  /**
   * Validates cart status code against allowed values.
   *
   * @param statusCode - Status code to validate
   * @throws Error - If status code is invalid
   *
   * @remarks
   * - Enforces business rule compliance
   * - Prevents injection of invalid status codes
   * - Used in constructor for immediate validation
   */
  private validateStatusCode(statusCode: string): void {
    if (!statusCode || statusCode.trim().length === 0) {
      throw new Error('Cart status code cannot be empty');
    }

    if (!Object.keys(CartStatus.VALID_TRANSITIONS).includes(statusCode)) {
      throw new Error(`Invalid cart status code: ${statusCode}`);
    }
  }

  /**
   * Checks if transition to new status is allowed.
   *
   * @param newStatus - Target status to transition to
   * @returns True if transition is valid
   *
   * @remarks
   * - Enforces state machine business rules
   * - Prevents fraudulent cart state changes
   * - Used in cart lifecycle workflows
   */
  canTransitionTo(newStatus: CartStatus): boolean {
    return CartStatus.VALID_TRANSITIONS[this.value]?.includes(newStatus.value) ?? false;
  }

  /**
   * Creates transition to new status with validation.
   *
   * @param newStatusCode - Target status code
   * @param initiatedBy - Who initiated the transition (sanitized for logging)
   * @returns New CartStatus instance
   * @throws Error - If transition is not allowed
   *
   * @remarks
   * - Atomic transition operation
   * - Includes audit trail context
   * - Prevents unauthorized state changes
   * - SECURITY: Sanitizes initiatedBy to prevent PII leakage in logs
   */
  transitionTo(newStatusCode: string, initiatedBy: string): CartStatus {
    const newStatus = new CartStatus(newStatusCode);

    if (!this.canTransitionTo(newStatus)) {
      // SECURITY: Sanitize initiatedBy to prevent PII in error logs
      const sanitizedInitiator = this.sanitizeForLogging(initiatedBy);
      throw new Error(
        `Invalid cart status transition from ${this.value} to ${newStatusCode}. Initiator: ${sanitizedInitiator}`
      );
    }

    return newStatus;
  }

  /**
   * Sanitizes sensitive information for logging.
   *
   * @param input - Input string to sanitize
   * @returns Sanitized string safe for logging
   *
   * @remarks
   * - Removes email addresses and PII
   * - Preserves system identifiers
   * - Used for security-safe logging
   */
  private sanitizeForLogging(input: string): string {
    if (input.includes('@')) {
      // Likely an email - show only domain
      const parts = input.split('@');
      return `${parts[0]!.slice(0, 3)}***@${parts[1]}`;
    }

    if (input.startsWith('user_') || input.startsWith('cust_')) {
      // System identifier - show prefix only
      const prefix = input.split('_')[0];
      return `${prefix}_***`;
    }

    // System or short identifier - show as-is
    return input.length <= 8 ? input : `${input.slice(0, 4)}***`;
  }

  /**
   * Checks if cart is in active state for modifications.
   *
   * @returns True if cart is active
   *
   * @remarks
   * - Used in cart modification workflows
   * - Prevents changes to converted carts
   */
  isActive(): boolean {
    return this.value === 'ACTIVE';
  }

  /**
   * Checks if cart can be converted to order.
   *
   * @returns True if cart can be converted
   *
   * @remarks
   * - Business rule: only active carts can be converted
   * - Prevents duplicate order creation
   */
  canBeConverted(): boolean {
    return this.isActive();
  }

  /**
   * Creates CartStatus from string.
   *
   * @param statusCode - Status code string
   * @returns CartStatus instance
   * @throws Error - If status code is invalid
   *
   * @example
   * ```ts
   * const status = CartStatus.from('ACTIVE');
   * ```
   */
  static from(statusCode: string): CartStatus {
    return new CartStatus(statusCode);
  }

  /**
   * Serializes status to string.
   *
   * @returns Status code string
   *
   * @remarks
   * - Used for database persistence
   * - Maintains clean serialization interface
   */
  toString(): string {
    return this.value;
  }

  /**
   * Compares two CartStatus instances.
   *
   * @param other - Another CartStatus instance
   * @returns True if equal
   *
   * @remarks
   * - Value-based equality
   * - Used in testing and validation
   */
  equals(other: CartStatus): boolean {
    return this.value === other.value;
  }
}
