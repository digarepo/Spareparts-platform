import { z } from 'zod';
import { ulid } from 'ulid';

/**
 * Opaque identifier for a tenant.
 *
 * @remarks
 *  - **Scope:** tenant
 *  - **Authority:** tenancy registry
 *  - **Invariants:**
 *      - never infer tenantId from user-controlled payload
 *      - tenantId is introduced at the trust boundary (auth/session/route)
 */

export const TenantIdSchema = z.string().min(1);

export type TenantId = z.infer<typeof TenantIdSchema>;

/**
 * Opaque identifier for a user (human or system principal).
 *
 * @remarks
 *  - **Scope:** platform|tenant
 *  - **Authority:** IAM identity provider
 */
export const UserIdSchema = z.string().min(1);

export type UserId = z.infer<typeof UserIdSchema>;

/**
 * Opaque identifier for a customer (storefront user).
 *
 * @remarks
 * - **Scope:** customer
 * - **Authority:** customer identity subsystem
 */
export const CustomerIdSchema = z.string().min(1);

export type CustomerId = z.infer<typeof CustomerIdSchema>;

/**
 * correlation identifier for tracing a request across services.
 *
 * @remarks
 *  - must be safe to log
 *  - must not contain secrets
 */
export const CorrelationIdSchema = z.string().min(8);

export type CorrelationId = z.infer<typeof CorrelationIdSchema>;

/**
 * Validates a ULID (Universally Unique Lexicographically Sortable Identifier).
 *
 * @remarks
 *  - **Scope:** platform
 *  - **Authority:** contracts only; no persistence semantics
 *  - **Invariants:** 26-character string, Crockford Base32 encoding
 *  - **Format:** 48-bit timestamp + 80-bit randomness
 *
 * ULIDs are sortable by generation time and URL-safe.
 * They're perfect for database primary keys and public identifiers.
 */
export const ULIDSchema = z.string().regex(/^[0-9A-HJKMNP-TV-z]{26}$/, "Invalid ULID format");
export type ULID = z.infer<typeof ULIDSchema>;

/**
 * Generates a new ULID.
 *
 * @remarks
 *  - Uses the ulid library for generation
 *  - Cryptographically secure randomness
 *  - Sortable by timestamp
 *
 * @returns A new ULID string
 */
export function generateULID(): ULID {
    return ulid();
}
