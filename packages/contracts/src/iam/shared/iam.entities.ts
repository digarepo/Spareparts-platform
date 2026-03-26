import { z } from 'zod';
import { ScopeSchema } from '@spareparts/contracts/scope';
import { IdentityIdSchema, AccountIdSchema, SessionIdSchema } from './iam.identifiers';

/**
 * IAM entity contracts.
 *
 * @remarks
 *  - **Scope:** platform
 *  - **Authority:** contracts only; no persistence semantics
 *  - **Invariants:** explicit scope boundaries, lifecycle awareness
 */

/**
 * Represents identity lifecycle status codes.
 *
 * @remarks
 *  - **active:** Identity can participate in accounts
 *  - **suspended:** Temporarily disabled, can be reactivated
 *  - **deactivated:** Permanently disabled, retains audit trail
 *  - **terminated:** Fully removed with audit retention
 *
 * These are descriptive codes only; behavior is enforced elsewhere.
 */
export const IdentityStatusSchema = z.union([
    z.literal("active"),
    z.literal("suspended"),
    z.literal("deactivated"),
    z.literal("terminated"),
]);
export type IdentityStatus = z.infer<typeof IdentityStatusSchema>;

/**
 * Represents account lifecycle status codes.
 *
 * @remarks
 *  - **active:** Account can authenticate and operate
 *  - **suspended:** Temporarily disabled, can be reactivated
 *  - **closed:** Permanently closed, retains audit trail
 *
 * These are descriptive codes only; behavior is enforced elsewhere.
 */
export const AccountStatusSchema = z.union([
    z.literal("active"),
    z.literal("suspended"),
    z.literal("closed"),
]);
export type AccountStatus = z.infer<typeof AccountStatusSchema>;

/**
 * Represents authentication event type codes.
 *
 * @remarks
 *  - **login_success:** Successful authentication
 *  - **login_failure:** Failed authentication attempt
 *  - **refresh:** Session token refresh
 *  - **logout:** Explicit session termination
 *  - **session_expired:** Automatic session expiration
 *  - **session_revoked:** Administrative session revocation
 *
 * These are descriptive codes only; behavior is enforced elsewhere.
 */
export const AuthEventTypeSchema = z.union([
    z.literal("login_success"),
    z.literal("login_failure"),
    z.literal("refresh"),
    z.literal("logout"),
    z.literal("session_expired"),
    z.literal("session_revoked"),
]);
export type AuthEventType = z.infer<typeof AuthEventTypeSchema>;

/**
 * Core identity entity contract.
 *
 * @remarks
 *  - Represents a global principal (who)
 *  - Scope-agnostic by design
 *  - Never contains tenant-specific information
 *  - Email must be globally unique where applicable
 */
export const IdentityEntitySchema = z.object({
    id: IdentityIdSchema,
    email: z.email().max(255),
    lifecycleStatusCode: IdentityStatusSchema,
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime()
});
export type IdentityEntity = z.infer<typeof IdentityEntitySchema>;

/**
 * Core account entity contract.
 *
 * @remarks
 *  - Represents scope-bound participation (where/how)
 *  - Links identity to specific execution context
 *  - Tenant-scoped accounts require tenantId
 *  - Platform-scoped accounts forbid tenantId
 */
export const AccountEntitySchema = z.object({
    id: AccountIdSchema,
    identityId: IdentityIdSchema,
    scopeCode: ScopeSchema,
    tenantId: z.string().optional(),
    accountStatusCode: AccountStatusSchema,
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime()
});
export type AccountEntity = z.infer<typeof AccountEntitySchema>;

/**
 * Core session entity contract.
 *
 * @remarks
 *  - Represents active authentication context
 *  - Links identity, account, scope, and tenant
 *  - Has explicit expiration for security
 *  - Can be revoked administratively
 */
export const SessionEntitySchema = z.object({
    id: SessionIdSchema,
    identityId: IdentityIdSchema,
    accountId: AccountIdSchema,
    scopeCode: ScopeSchema,
    tenantId: z.string().optional(),
    createdAt: z.iso.datetime(),
    expiresAt: z.iso.datetime(),
    revokedAt: z.iso.datetime().optional(),
    revokedReasonCode: z.string().optional()
});
export type SessionEntity = z.infer<typeof SessionEntitySchema>;
