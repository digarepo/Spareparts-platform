import { z } from 'zod';
import { IdentityIdSchema } from '../shared/iam.identifiers';

/**
 * Authentication entity contracts.
 *
 * @remarks
 *  - **Scope:** platform
 *  - **Authority:** contracts only; no persistence semantics
 *  - **Invariants:** framework-agnostic validation, credential safety
 */

/**
 * Password credential entity contract.
 *
 * @remarks
 *  - Stores hashed password only
 *  - Never stores plain text passwords
 *  - Includes algorithm metadata for verification
 *  - One-to-one with identity
 */
export const PasswordCredentialEntitySchema = z.object({
    identityId: IdentityIdSchema,
    passwordHash: z.string().min(60).max(255),
    algorithm: z.string().min(1).max(50),
    algorithmParams: z.record(z.string(), z.unknown().optional()),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
});
export type PasswordCredentialEntity = z.infer<typeof PasswordCredentialEntitySchema>;

/**
 * Password change request contract.
 *
 * @remarks
 *  - Requires current password for verification
 *  - New password must meet security requirements
 *  - Used for self-service password changes
 */
export const PasswordChangeRequestSchema = z.object({
    currentPassword: z.string().min(8).max(128),
    newPassword: z.string().min(8).max(128),
    confirmPassword: z.string().min(8).max(128)
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
export type PasswordChangeRequest = z.infer<typeof PasswordChangeRequestSchema>;

/**
 * Password reset request contract.
 *
 * @remarks
 *  - Email address for password reset
 *  - Initiates secure reset flow
 *  - Used for forgotten password scenarios
 */
export const PasswordResetRequestSchema = z.object({
    email: z.email().max(255),
});
export type PasswordResetRequest = z.infer<typeof PasswordResetRequestSchema>;
