import { z } from 'zod';
import { RoleCodeSchema } from '../shared/iam.identifiers';

/**
 * Authorization request contracts.
 *
 * @remarks
 *  - **Scope:** platform
 *  - **Authority:** contracts only; no persistence semantics
 *  - **Invariants:** role-based permissions, scope-aware access control
 */

/**
 * Role assignment request contract.
 *
 * @remarks
 *  - Assigns role to account within scope
 *  - Requires explicit justification
 *  - Used by tenant and platform administrators
 *  - Audited for security compliance
 */
export const RoleAssignmentRequestSchema = z.object({
    accountId: z.string(),
    roleCode: RoleCodeSchema,
    reason: z.string().max(500).optional(),
});
export type RoleAssignmentRequest = z.infer<typeof RoleAssignmentRequestSchema>;

/**
 * Role removal request contract.
 *
 * @remarks
 *  - Removes role from account
 *  - Requires explicit justification
 *  - Used by tenant and platform administrators
 *  - Audited for security compliance
 */
export const RoleRemovalRequestSchema = z.object({
    accountId: z.string(),
    roleCode: RoleCodeSchema,
    reason: z.string().max(500).optional(),
});
export type RoleRemovalRequest = z.infer<typeof RoleRemovalRequestSchema>;

/**
 * Permission check request contract.
 *
 * @remarks
 *  - Checks if account has specific permission
 *  - Used for authorization decisions
 *  - Includes context for evaluation
 *  - Supports resource-specific checks
 */
export const PermissionCheckRequestSchema = z.object({
    accountId: z.string(),
    permissionCode: z.string(),
    resourceId: z.string().optional(),
    context: z.record(z.string(), z.unknown().optional()),
});
export type PermissionCheckRequest = z.infer<typeof PermissionCheckRequestSchema>;

/**
 * Permission check response contract.
 *
 * @remarks
 *  - Result of permission evaluation
 *  - Includes decision and metadata
 *  - Used for authorization decisions
 *  - Supports audit and debugging
 */
export const PermissionCheckResponseSchema = z.object({
    granted: z.boolean(),
    permissionCode: z.string(),
    resourceId: z.string().optional(),
    checkedAt: z.iso.datetime(),
    metadata: z.record(z.string(), z.unknown().optional()),
});
export type PermissionCheckResponse = z.infer<typeof PermissionCheckRequestSchema>;
