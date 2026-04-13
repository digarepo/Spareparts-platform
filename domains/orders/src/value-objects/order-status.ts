/**
 * Order status value object with state machine validation.
 *
 * @remarks
 * - **Scope:** order lifecycle management
 * - **Authority:** domain business rules only
 * - **Invariants:** status transitions follow strict state machine rules
 * - **Security:** prevents invalid state transitions that could cause fraud
 */
export class OrderStatus {
    private static readonly VALID_TRANSITIONS: Record<string, string[]> = {
        PENDING: ['CONFIRMED', 'CANCELLED'],
        CONFIRMED: ['IN_PROGRESS', 'CANCELLED'],
        IN_PROGRESS: ['SHIPPED', 'CANCELLED', 'FAILED'],
        SHIPPED: ['COMPLETED', 'FAILED'],
        COMPLETED: [],
        CANCELLED: [],
        FAILED: ['PENDING'],
    };

    private static readonly TERMINAL_STATES = new Set(['COMPLETED', 'CANCELLED']);

    constructor(
        public readonly value: string,
        public readonly timestamp: Date = new Date()
    ) {
        this.validateStatusCode(value);
    }
    /**
     * Validates status code against allowed values.
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
        if(!statusCode || statusCode.trim().length === 0) {
            throw new Error('Order status code cannot be empty');
        }

        if(!Object.keys(OrderStatus.VALID_TRANSITIONS).includes(statusCode)) {
            throw new Error(`Invalid order status code: ${statusCode}`);
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
     * - Prevents fraudulent status changes
     * - Used in order update workflows
     */
    canTransitionTo(newStatus: OrderStatus): boolean{
        return OrderStatus.VALID_TRANSITIONS[this.value]?.includes(newStatus.value) ?? false;
    }

    /**
     * Creates transition to new status with validation.
     *
     * @param newStatusCode - Target status code
     * @param initiatedBy - Who initiated the transition (sanitized for logging)
     * @returns New OrderStatus instance
     * @throws Error - If transition is not allowed
     *
     * @remarks
     * - Atomic transition operation
     * - Includes audit trail context
     * - Prevents unauthorized state changes
     * - SECURITY: Sanitizes initiatedBy to prevent PII leakage in logs
     */
    transitionTo(newStatusCode: string, initiatedBy: string): OrderStatus {
    const newStatus = new OrderStatus(newStatusCode);

    if (!this.canTransitionTo(newStatus)) {
      // SECURITY: Sanitize initiatedBy to prevent PII in error logs
      const sanitizedInitiator = this.sanitizeForLogging(initiatedBy);
      throw new Error(
        `Invalid status transition from ${this.value} to ${newStatusCode}. Initiator: ${sanitizedInitiator}`
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
   * Checks if status is terminal (no further transitions allowed).
   *
   * @returns True if status is terminal
   *
   * @remarks
   * - Used in business logic to prevent modifications
   * - Ensures data integrity for completed orders
   */
  isTerminal(): boolean{
    return OrderStatus.TERMINAL_STATES.has(this.value);
  }

  /**
   * Checks if order can be cancelled.
   *
   * @returns True if order can be cancelled
   *
   * @remarks
   * - Business rule: only non-terminal states can be cancelled
   * - Prevents cancellation of completed orders
   */
  canBeCancelled(): boolean{
    return !this.isTerminal() && this.value !== 'CANCELLED';
  }

  /**
   * Creates OrderStatus from string.
   *
   * @param statusCode - Status code string
   * @returns OrderStatus instance
   * @throws Error - If status code is invalid
   *
   * @example
   * ```ts
   * const status = OrderStatus.from('PENDING');
   * ```
   */
  static from(statusCode: string): OrderStatus{
    return new OrderStatus(statusCode);
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
   * Compares two OrderStatus instances.
   *
   * @param other - Another OrderStatus instance
   * @returns True if equal
   *
   * @remarks
   * - Value-based equality
   * - Used in testing and validation
   */
  equals(other: OrderStatus): boolean {
    return this.value === other.value;
  }
}
