/**
 * Base class for all domain-level errors.
 *
 * Domain errors represent violations of business rules and are intended
 * to be surfaced to API clients with meaningful error codes.
 */
export class DomainError extends Error {
  /**
   * Machine-readable error code.
   */
  public readonly code: string;

  /**
   * Suggested HTTP status code.
   */
  public readonly status: number;

  constructor(code: string, message: string, status = 400) {
    super(message);

    this.code = code;
    this.status = status;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
