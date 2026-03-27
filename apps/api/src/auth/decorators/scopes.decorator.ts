import { SetMetadata } from '@nestjs/common';
import type { Scope } from '@spareparts/contracts';

/**
 * Scopes decorator for specifying required authentication scopes.
 *
 * @remarks
 * - **Scope:** platform
 * - **Authority:** Route-level authorization
 * - **Invariants:** Explicit scope requirements, no implicit access
 * 
 * Used to mark endpoints with required authentication scopes.
 * The ScopesGuard will validate these requirements against the user's token.
 * 
 * @example
 * ```typescript
 * @Scopes('platform', 'tenant')
 * @Get('admin/settings')
 * getAdminSettings() {
 *   // Only platform or tenant scope users can access
 * }
 * ```
 * 
 * @example
 * ```typescript
 * @Scopes('customer')
 * @Get('profile')
 * getCustomerProfile() {
 *   // Only customer scope users can access
 * }
 * ```
 */
export const Scopes = (...scopes: Scope[]) => SetMetadata('requiredScopes', scopes);

/**
 * Metadata key for storing required scopes.
 *
 * @remarks
 * - Used internally by ScopesGuard
 * - Should not be used directly in application code
 */
export const SCOPES_KEY = 'requiredScopes';

/**
 * Public scopes decorator for endpoints that don't require authentication.
 *
 * @remarks
 * - Marks endpoints as publicly accessible
 * - Bypasses scope validation entirely
 * - Use with caution - only for truly public endpoints
 * 
 * @example
 * ```typescript
 * @Public()
 * @Get('health')
 * getHealth() {
 *   return { status: 'ok' };
 * }
 * ```
 */
export const Public = () => SetMetadata('isPublic', true);

/**
 * Public endpoint metadata key.
 *
 * @remarks
 * - Used internally by ScopesGuard
 * - Should not be used directly in application code
 */
export const PUBLIC_KEY = 'isPublic';
