import { z } from 'zod';
import { ScopeSchema } from '@spareparts/contracts/scope';

/**
 * Authentication request contracts.
 *
 * @remarks
 *  - **Scope:** platform
 *  - **Authority:** contracts only; no persistence semantics
 *  - **Invariants:** framework-agnostic validation, credential safety
 */

/**
 * Validates a password-based authentication request.
 *
 * @remarks
 *  - Email must be valid format
 *  - Password must be at least 8 characters
 *  - Scope must be explicitly provided
 *  - TenantId required for tenant scope
 */
export const PasswordAuthRequestSchema = z.object({
    email: z.email().max(255),
    password: z.string().min(8).max(128),
    scopeCode: ScopeSchema,
    tenantId: z.string().optional()
});
export type PasswordAuthRequest = z.infer<typeof PasswordAuthRequestSchema>;

/**
 * Validates a session refresh request.
 *
 * @remarks
 *  - Refresh token must be valid format
 *  - Used to extend active sessions
 *  - Generates new session tokens
 */
export const RefreshTokenRequestSchema = z.object({
    refreshToken: z.string().min(32).max(512),
});
export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;

/**
 * Validates a logout request.
 *
 * @remarks
 *  - Refresh token for session revocation
 *  - Can also support session-specific logout
 *  - Used for explicit session termination
 */
export const LogoutRequestSchema = z.object({
    refreshToken: z.string().min(32).max(512),
    sessionId: z.string().optional(),
    logoutAll: z.boolean().default(false),
});
export type LogoutRequest = z.infer<typeof LogoutRequestSchema>;
