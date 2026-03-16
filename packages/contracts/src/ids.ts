import { z } from 'zod';

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
