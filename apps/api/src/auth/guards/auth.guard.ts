import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { TokenService } from '../../infrastructure/token.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthContext } from '../../prisma/auth-context.extension';
import type { Request } from 'express';

/**
 * Authentication guard for protecting endpoints.
 *
 * @remarks
 * - **Scope:** platform
 * - **Authority:** JWT validation and identity establishment
 * - **Invariants:** Identity-only, no authorization decisions
 * - **RLS Integration:** Sets database context for tenant isolation
 */
@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly tokenService: TokenService,
        private readonly prisma: PrismaService,
    ) {}

    /**
     * Validates request authentication token.
     *
     * @param context - NestJS execution context
     * @returns True if authentication is valid
     *
     * @throws UnauthorizedException - When token is missing or invalid
     *
     * @remarks
     * - Extracts JWT from Authorization header
     * - Validates token using domain service
     * - Attaches authentication context to request
     * - Sets database context for RLS policies using Prisma extension
     */
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request & { auth?: AuthContext }>();
        const token = this.extractTokenFromRequest(request);

        if (!token) {
            throw new UnauthorizedException('Authentication token required');
        }

        try {
            // Validate token and extract payload
            const payload = await this.tokenService.validateAccessToken(token);

            // Create auth context
            const authContext: AuthContext = {
                identityId: payload.identityId,
                accountId: payload.accountId,
                scope: payload.scope,
                tenantId: payload.tenantId,
            };

            // Attach authentication context to request
            request.auth = authContext;

            // Set database context using Prisma extension
            this.setDatabaseContext(authContext);

            return true;
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired authentication token');
        }
    }

    /**
     * Extracts JWT token from Authorization header.
     *
     * @param request - Express request object
     * @returns JWT token or null if not found
     *
     * @remarks
     * - Supports Bearer token format
     * - Case-insensitive header parsing
     */
    private extractTokenFromRequest(request: Request): string | null {
        const authHeader = request.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }
        return null;
    }

    /**
     * Sets database context for RLS policies.
     *
     * @param authContext - Authentication context
     *
     * @remarks
     * - Uses Prisma extension with AsyncLocalStorage
     * - Ensures context isolation between requests
     * - Automatically applies to all subsequent queries
     * - No connection pollution issues
     */
    private setDatabaseContext(authContext: AuthContext): void {
        // Set context using Prisma extension
        this.prisma.setAuthContext(authContext);
    }
}

/**
 * Extension to make auth context available on requests.
 */
declare global {
    namespace Express {
        interface Request {
            auth?: AuthContext;
        }
    }
}
