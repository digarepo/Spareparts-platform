import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { SCOPES_KEY, PUBLIC_KEY } from '../decorators/scopes.decorator';
import type { Scope } from '@spareparts/contracts';
import type { Request } from 'express';

/**
 * Scopes validation guard for enforcing authorization requirements.
 *
 * @remarks
 * - **Scope:** platform
 * - **Authority:** Scope-based authorization
 * - **Invariants:** Strict scope validation, prevents privilege escalation
 * - **Security:** Prevents cross-scope access attempts
 *
 * This guard must be used in conjunction with AuthGuard to ensure
 * that authentication context is available for scope validation.
 *
 * @example
 * ```typescript
 * @UseGuards(AuthGuard, ScopesGuard)
 * @Scopes('platform', 'tenant')
 * @Get('admin/users')
 * getUsers() {
 *   // Only accessible by platform or tenant scope users
 * }
 * ```
 */
@Injectable()
export class ScopesGuard implements CanActivate {
    private readonly logger = new Logger(ScopesGuard.name);

    constructor(private readonly reflector: Reflector) {}

    /**
     * Validates that the user's scope matches the endpoint requirements.
     *
     * @param context - NestJS execution context
     * @returns True if user has required scopes
     * @throws ForbiddenException - When scope requirements are not met
     *
     * @remarks
     * - Checks for public endpoints first
     * - Validates required scopes against user's token scope
     * - Provides detailed error messages for debugging
     */
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request & { auth?: { scope: Scope } }>();

        // Check if endpoint is marked as public
        const isPublic = this.reflector.get<boolean>(PUBLIC_KEY, context.getHandler());
        if (isPublic) {
            return true;
        }

        // Get required scopes from metadata
        const requiredScopes = this.reflector.get<Scope[]>(SCOPES_KEY, context.getHandler()) || [];

        // If no scopes are required, allow access (but this should be avoided)
        if (requiredScopes.length === 0) {
            this.logger.warn('Endpoint has no scope requirements defined. Consider adding @Scopes decorator.', {
                endpoint: `${request.method} ${request.url}`,
                handler: context.getHandler().name
            });
            return true;
        }

        // Get user's scope from auth context (set by AuthGuard)
        const userScope = request.auth?.scope;

        if (!userScope) {
            throw new ForbiddenException('Authentication context not found. Ensure AuthGuard is applied before ScopesGuard.');
        }

        // Validate user's scope against required scopes
        const hasRequiredScope = requiredScopes.includes(userScope);

        if (!hasRequiredScope) {
            throw new ForbiddenException(`Access denied. Required scope: ${requiredScopes.join(' or ')}. Current scope: ${userScope}`);
        }

        // Log scope validation for security monitoring
        this.logger.log('Scope validation successful', {
            endpoint: `${request.method} ${request.url}`,
            requiredScopes,
            userScope,
            identityId: request.auth?.identityId,
            timestamp: new Date().toISOString()
        });

        return true;
    }
}

/**
 * Combined guard for authentication and scope validation.
 *
 * @remarks
 * - Convenience guard that applies both AuthGuard and ScopesGuard
 * - Ensures proper order of execution (auth first, then scopes)
 * - Recommended for most use cases
 *
 * @example
 * ```typescript
 * @UseGuards(AuthAndScopesGuard)
 * @Scopes('platform')
 * @Get('admin/dashboard')
 * getDashboard() {
 *   // Authenticated and scope-validated access
 * }
 * ```
 */
export const AuthAndScopesGuard = [AuthGuard, ScopesGuard] as const;
