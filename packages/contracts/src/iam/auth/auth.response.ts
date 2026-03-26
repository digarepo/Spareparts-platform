import { success, z } from 'zod';
import { IdentityIdSchema, AccountIdSchema, SessionIdSchema } from '../shared/iam.identifiers';
import { ScopeSchema } from '../../scope';

/**
 * Authentication response contracts.
 *
 * @remarks
 *  - **Scope:** platform
 *  - **Authority:** contracts only; no persistence semantics
 *  - **Invariants:** framework-agnostic validation, token security
 */

/**
 * Authentication success response.
 *
 * @remarks
 *  - Contains session tokens for API access
 *  - Includes user context for client applications
 *  - Tokens have explicit expiration
 *  - Never contains sensitive credential data
 */
export const AuthResponseSchema = z.object({
    accessToken: z.string().min(32).max(512),
    refreshToken: z.string().min(32).max(512),
    tokenType: z.literal("Bearer"),
    expiresIn: z.number().positive(),
    refreshExpires: z.number().positive(),
    user: z.object({
        identityId: IdentityIdSchema,
        accountId: AccountIdSchema,
        sessionId: SessionIdSchema,
        scopeCode: ScopeSchema,
        tenantId: z.string().optional(),
    }),
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

/**
 * Session refresh response.
 *
 * @remarks
 *  - Contains new session tokens
 *  - Extends existing session validity
 *  - Same structure as initial auth response
 */
export const RefreshTokenResponseSchema = AuthResponseSchema;
export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponseSchema>;

/**
 * Logout response.
 *
 * @remarks
 *  - Confirms successful session termination
 *  - Minimal response for security
 */
export const LogoutResponseSchema = z.object({
    success: z.literal(true),
    message: z.string(),
});
export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;
