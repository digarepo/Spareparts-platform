import { z } from 'zod';
import { ScopeSchema } from '../../scope';
import { RoleCodeSchema, PermissionCodeSchema } from '../shared/iam.identifiers';

/**
 * Authorization entity contracts.
 *
 * @remarks
 *  - **Scope:** platform
 *  - **Authority:** contracts only; no persistence semantics
 *  - **Invariants:** role-based permissions, scope-aware access control
 */

/**
 * Role entity contract.
 *
 * @remarks
 *  - Represents a collection of permissions
 *  - Scope-bound to prevent cross-scope assignment
 *  - Human-readable for management interfaces
 *  - Stable codes for referential integrity
 */
export const RoleEntitySchema = z.object({
    code: RoleCodeSchema,
    scopeCode: ScopeSchema,
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
});
export type RoleEntity = z.infer<typeof RoleEntitySchema>;

/**
 * Permission entity contract.
 *
 * @remarks
 *  - Represents a granular permission
 *  - Scope-bound to prevent cross-scope assignment
 *  - Action:resource format for clarity
 *  - Descriptive for audit and management
 */
export const PermissionEntitySchema = z.object({
    code: PermissionCodeSchema,
    scopeCode: ScopeSchema,
    action: z.string().min(1).max(50),
    description: z.string().max(500).optional(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
});
export type PermissionEntity = z.infer<typeof PermissionEntitySchema>;

/**
 * Role assignment entity contract.
 *
 * @remarks
 *  - Links account to role within scope
 *  - Prevents cross-scope role assignment
 *  - Tracks assignment metadata for audit
 *  - Supports multiple roles per account
 */
export const AccountRoleEntitySchema = z.object({
    accountId: z.string(),
    roleCode: RoleCodeSchema,
    assignedAt: z.iso.datetime(),
    assignedBy: z.string(),
    reason: z.string().max(500).optional(),
});
export type AccountRoleEntity = z.infer<typeof AccountRoleEntitySchema>;

/**
 * Permission grant entity contract.
 *
 * @remarks
 *  - Links role to permission
 *  - Prevents cross-scope permission grants
 *  - Tracks grant metadata for audit
 *  - Supports many-to-many relationships
 */
export const RolePermissionEntitySchema = z.object({
    roleCode: RoleCodeSchema,
    permissionCode: PermissionCodeSchema,
    grantedAt: z.iso.datetime(),
    reason: z.string().max(500).optional(),
});
export type RolePermissionEntity = z.infer<typeof RolePermissionEntitySchema>;
