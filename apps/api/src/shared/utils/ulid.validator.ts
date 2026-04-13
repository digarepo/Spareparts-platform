/**
 * ULID Validation Utility.
 *
 * @remarks
 * - **Scope:** ULID format validation for all entity IDs
 * - **Authority:** Prevents malformed ID injection attacks
 * - **Invariants:** Strict ULID format compliance
 * - **Security:** Prevents database injection via malformed IDs
 *
 * Features:
 * - ULID regex pattern validation
 * - Length and format checking
 * - Performance optimized validation
 * - Comprehensive error messages
 */

/**
 * ULID regex pattern for validation.
 * ULID format: 26 characters, Crockford's Base32 encoding
 * Timestamp part (10 chars) + randomness part (16 chars)
 */
export const ULID_REGEX = /^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$/;

/**
 * Validates if a string is a properly formatted ULID.
 *
 * @param id - The ID to validate
 * @returns boolean - True if valid ULID format
 */
export function isValidUlid(id: string): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }
  
  return ULID_REGEX.test(id);
}

/**
 * Validates ULID and throws detailed error for invalid format.
 *
 * @param id - The ID to validate
 * @param context - Context for error messages (e.g., 'orderId', 'cartId')
 * @throws {Error} When ID format is invalid
 */
export function validateUlid(id: string, context: string = 'ID'): void {
  if (!id) {
    throw new Error(`${context} is required`);
  }
  
  if (typeof id !== 'string') {
    throw new Error(`${context} must be a string`);
  }
  
  if (!isValidUlid(id)) {
    throw new Error(
      `Invalid ${context} format: '${id}'. Expected 26-character ULID format (Crockford's Base32)`
    );
  }
}

/**
 * Sanitizes and validates ULID from request parameters.
 *
 * @param param - Parameter from request (could be string or string[])
 * @param context - Context for error messages
 * @returns string - Validated ULID
 * @throws {Error} When parameter is invalid
 */
export function sanitizeUlidParam(param: string | string[] | undefined, context: string = 'ID'): string {
  if (Array.isArray(param)) {
    throw new Error(`${context} cannot be an array`);
  }
  
  if (!param) {
    throw new Error(`${context} is required`);
  }
  
  validateUlid(param, context);
  return param;
}
