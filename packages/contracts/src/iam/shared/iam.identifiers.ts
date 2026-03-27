import { z } from 'zod';
import { ULIDSchema } from '../../ids';

/**
 * IAM identifier contracts.
 *
 * @remarks
 *  - **Scope:** platform
 *  - **Authority:** contracts only; no persistence semantics
 *  - **Invariants:** ULID-based identifiers for all IAM entities
 */

/**
 * Validates a unique identity identifier.
 *
 * @remarks
 *  - ULID format for sortable, globally unique IDs
 *  - Used for identity-level operations
 *  - Never reused across identities
 */
export const IdentityIdSchema = ULIDSchema;
export type IdentityId = z.infer<typeof IdentityIdSchema>;

/**
 * Validates a unique account identifier.
 *
 * @remarks
 *  - ULID format for sortable, globally unique IDs
 *  - Used for account-level operations
 *  - Links identity to scope context
 */
export const AccountIdSchema = ULIDSchema;
export type AccountId = z.infer<typeof AccountIdSchema>;

/**
 * Validates a unique session identifier.
 *
 * @remarks
 *  - ULID format for sortable, globally unique IDs
 *  - Used for session tracking and revocation
 *  - Short-lived, expires automatically
 */
export const SessionIdSchema = ULIDSchema;
export type SessionId = z.infer<typeof SessionIdSchema>;

/**
 * Validates a unique role identifier.
 *
 * @remarks
 *  - String-based role code (not ULID)
 *  - Human-readable and stable
 *  - Used for role assignments and permissions
 */
export const RoleCodeSchema = z.string().min(1).max(50);
export type RoleCode = z.infer<typeof RoleCodeSchema>;

/**
 * Validates a unique permission identifier.
 *
 * @remarks
 *  - String-based permission code (not ULID)
 *  - Format: "action:resource" (e.g., "catalog:product:create")
 *  - Used for granular permission checks
 */
export const PermissionCodeSchema = z.string().min(1).max(100);
export type PermissionCode = z.infer<typeof PermissionCodeSchema>;
