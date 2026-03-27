import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from './audit.service';
import { AuthService as DomainAuthService, AuthenticationResult } from '../../../../domains/iam/auth/auth.functions';
import { IdentityModel, AccountModel } from '../../../../domains/iam/models';
import { canIdentityAuthenticate, canAccountAuthenticate } from '../../../../domains/iam/models';
import { generateULID } from '@spareparts/contracts';
import type { AuthResponse } from '@spareparts/contracts/iam';
import type { PasswordAuthRequest } from '@spareparts/contracts/iam';
import type { Scope } from '@spareparts/contracts';

/**
 * API layer authentication service.
 *
 * @remarks
 * - **Scope:** platform
 * - **Authority:** Domain services and Prisma persistence
 * - **Invariants:** Thin wrapper around domain logic, no authentication logic here
 * - **Threading/Async:** All operations are async and transaction-safe
 * - **Side effects:** Database mutations, audit logging
 * - **Tenancy:** Enforces tenant isolation at data access layer
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly domainAuthService: DomainAuthService;

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {
    this.domainAuthService = new DomainAuthService();
  }

  /**
   * Registers a new identity and account.
   *
   * @param params - Registration parameters
   * @returns Authentication response with tokens
   *
   * @throws ConflictException - When email already exists
   * @throws UnauthorizedException - When registration fails
   *
   * @remarks
   * - Creates identity, account, and credentials in transaction
   * - Uses domain service for authentication logic
   * - Records comprehensive audit trail
   */
  async register(params: {
    email: string;
    password: string;
    scope: string;
    tenantId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuthResponse> {
    try {
      // Validate scope and tenant context
      this.validateScopeContext(params.scope, params.tenantId);

      // Check for existing identity
      const existingIdentity = await this.prisma.db.identity.findUnique({
        where: { email: params.email },
      });

      if (existingIdentity) {
        await this.auditService.recordAuthFailure({
          identityId: existingIdentity.id,
          eventType: 'register_failure',
          scope: params.scope,
          tenantId: params.tenantId,
          failureReason: 'Email already exists',
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        });
        throw new ConflictException('Email already registered');
      }

      // Create identity, account, and credentials in transaction
      const result = await this.prisma.db.$transaction(async (tx) => {
        // Create identity
        const identity = await tx.identity.create({
          data: {
            id: generateULID(),
            email: params.email,
          },
        });

        // Create account
        const account = await tx.account.create({
          data: {
            id: generateULID(),
            identityId: identity.id,
            scopeCode: params.scope,
            tenantId: params.tenantId || null,
          },
        });

        // Create password credential
        const passwordHash = await this.domainAuthService['passwordService'].hashPassword(params.password);
        await tx.passwordCredential.create({
          data: {
            identityId: identity.id,
            passwordHash,
            algorithm: 'argon2id',
          },
        });

        // Create session
        const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const session = await tx.session.create({
          data: {
            id: generateULID(),
            identityId: identity.id,
            accountId: account.id,
            scopeCode: params.scope,
            tenantId: params.tenantId || null,
            expiresAt: sessionExpiresAt,
          },
        });

        return { identity, account, session };
      });

      // Convert to domain models
      const identityModel: IdentityModel = {
        id: result.identity.id as string,
        email: result.identity.email,
        lifecycleStatusCode: 'active',
        createdAt: result.identity.createdAt,
        updatedAt: result.identity.updatedAt,
      };

      const accountModel: AccountModel = {
        id: result.account.id as string,
        identityId: result.account.identityId,
        scopeCode: params.scope as Scope,
        tenantId: params.tenantId,
        accountStatusCode: 'active',
        createdAt: result.account.createdAt,
        updatedAt: result.account.updatedAt,
      };

      // Use domain service for authentication (auto-auth for new registration)
      const authResult = await this.domainAuthService.authenticate(
        params.email,
        params.password,
        identityModel,
        accountModel,
        await this.domainAuthService['passwordService'].hashPassword(params.password)
      );

      // Record successful registration
      await this.auditService.recordAuthSuccess({
        identityId: result.identity.id,
        accountId: result.account.id,
        eventType: 'register_success',
        scope: params.scope,
        tenantId: params.tenantId,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      });

      this.logger.log(`Identity registered: ${result.identity.id}`);

      return this.mapDomainResultToResponse(authResult);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      this.logger.error('Registration failed:', error);
      await this.auditService.recordAuthFailure({
        eventType: 'register_failure',
        failureReason: 'Registration failed',
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      });

      throw new UnauthorizedException('Registration failed');
    }
  }

  /**
   * Authenticates credentials and issues tokens.
   *
   * @param params - Login parameters
   * @returns Authentication response with tokens
   *
   * @throws UnauthorizedException - When credentials are invalid
   *
   * @remarks
   * - Uses domain service for authentication logic
   * - Validates identity and account lifecycle
   * - Records authentication attempts
   */
  async login(params: {
    email: string;
    password: string;
    scope?: string;
    tenantId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuthResponse> {
    try {
      const effectiveScope = params.scope || 'customer';
      this.validateScopeContext(effectiveScope, params.tenantId);

      // Find identity with credentials
      const identity = await this.prisma.db.identity.findUnique({
        where: { email: params.email },
        include: {
          passwordCredentials: true,
        },
      });

      if (!identity || identity.passwordCredentials.length === 0) {
        await this.auditService.recordAuthFailure({
          identityId: identity?.id,
          eventType: 'login_failure',
          scope: effectiveScope,
          tenantId: params.tenantId,
          failureReason: 'Invalid credentials',
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        });
        throw new UnauthorizedException('Invalid credentials');
      }

      // Find account for scope
      const account = await this.prisma.db.account.findFirst({
        where: {
          identityId: identity.id,
          scopeCode: effectiveScope,
          tenantId: params.tenantId || null,
        },
      });

      if (!account) {
        await this.auditService.recordAuthFailure({
          identityId: identity.id,
          eventType: 'login_failure',
          scope: effectiveScope,
          tenantId: params.tenantId,
          failureReason: 'No account found for this scope',
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        });
        throw new UnauthorizedException('No account found for this scope');
      }

      // Convert to domain models
      const identityModel: IdentityModel = {
        id: identity.id as string,
        email: identity.email,
        lifecycleStatusCode: identity.lifecycleStatusCode as 'active' | 'suspended' | 'deactivated' | 'terminated',
        createdAt: identity.createdAt,
        updatedAt: identity.updatedAt,
      };

      const accountModel: AccountModel = {
        id: account.id as string,
        identityId: account.identityId,
        scopeCode: account.scopeCode as Scope,
        tenantId: account.tenantId || undefined,
        accountStatusCode: account.accountStatusCode as 'active' | 'suspended' | 'closed',
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      };

      // Use domain service for authentication
      const authResult = await this.domainAuthService.authenticate(
        params.email,
        params.password,
        identityModel,
        accountModel,
        identity.passwordCredentials[0]!.passwordHash
      );

      // Create session record
      const session = await this.prisma.db.session.create({
        data: {
          id: authResult.session.id,
          identityId: authResult.session.identityId,
          accountId: authResult.session.accountId,
          scopeCode: authResult.session.scope,
          tenantId: authResult.session.tenantId || null,
          expiresAt: authResult.session.expiresAt,
        },
      });

      // Record successful login
      await this.auditService.recordAuthSuccess({
        identityId: identity.id,
        accountId: account.id,
        eventType: 'login_success',
        scope: effectiveScope,
        tenantId: params.tenantId,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      });

      this.logger.log(`Identity authenticated: ${identity.id}`);

      return this.mapDomainResultToResponse(authResult);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error('Login failed:', error);
      await this.auditService.recordAuthFailure({
        eventType: 'login_failure',
        failureReason: 'Login failed',
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      });

      throw new UnauthorizedException('Login failed');
    }
  }

  /**
   * Refreshes access and refresh tokens.
   *
   * @param params - Refresh token parameters
   * @returns Authentication response with rotated tokens
   *
   * @throws UnauthorizedException - When refresh token is invalid
   *
   * @remarks
   * - Uses domain service for token rotation
   * - Creates new session record
   * - Revokes old session
   */
  async refreshToken(params: {
    refreshToken: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuthResponse> {
    try {
      // Validate refresh token to extract token family
      const tokenPayload = await this.domainAuthService['tokenService'].validateRefreshToken(params.refreshToken);

      // Find the current session to get token family
      const currentSession = await this.prisma.db.session.findFirst({
        where: {
          id: tokenPayload.tokenFamily,
          // Grace period: allow sessions revoked within last 30 seconds for race condition handling
          OR: [
            { revokedAt: null },
            {
              revokedAt: {
                gte: new Date(Date.now() - 30000) // 30 seconds ago
              }
            }
          ],
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!currentSession) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      // Check for race condition: session was recently revoked (within grace period)
      const isRaceCondition = currentSession.revokedAt &&
        (Date.now() - currentSession.revokedAt.getTime()) < 30000;

      if (isRaceCondition) {
        // This might be a race condition - check if we can find a newer session for the same token family
        const newerSession = await this.prisma.db.session.findFirst({
          where: {
            id: tokenPayload.tokenFamily,
            revokedAt: null,
            expiresAt: { gt: new Date() },
            createdAt: { gt: currentSession.createdAt }
          },
        });

        if (newerSession) {
          // Race condition detected - another refresh already succeeded
          throw new UnauthorizedException('Token already refreshed');
        }

        // Allow this refresh to proceed (likely a legitimate retry)
        this.logger.warn('Refresh token race condition detected, allowing retry', {
          sessionId: currentSession.id,
          revokedAt: currentSession.revokedAt,
          timeSinceRevocation: Date.now() - (currentSession.revokedAt?.getTime() || 0)
        });
      }

      // Use domain service for token rotation with proper family
      const authResult = await this.domainAuthService.rotateRefreshToken(
        params.refreshToken,
        tokenPayload.tokenFamily
      );

      // Create new session record
      const session = await this.prisma.db.session.create({
        data: {
          id: authResult.session.id,
          identityId: authResult.session.identityId,
          accountId: authResult.session.accountId,
          scopeCode: authResult.session.scope,
          tenantId: authResult.session.tenantId || null,
          expiresAt: authResult.session.expiresAt,
        },
      });

      // Revoke old session (with grace period consideration)
      if (!isRaceCondition) {
        // Normal revocation - immediate
        await this.prisma.db.session.updateMany({
          where: {
            identityId: authResult.session.identityId,
            accountId: authResult.session.accountId,
            revokedAt: null,
            id: { not: authResult.session.id }, // Don't revoke the new session
          },
          data: {
            revokedAt: new Date(),
          },
        });
      } else {
        // Race condition - we're in grace period, so the old session is already revoked
        this.logger.log('Skipping session revocation due to race condition grace period', {
          newSessionId: session.id,
          oldSessionId: currentSession.id
        });
      }

      // Record successful refresh
      await this.auditService.recordAuthSuccess({
        identityId: authResult.session.identityId,
        accountId: authResult.session.accountId,
        eventType: 'refresh_success',
        scope: authResult.session.scope,
        tenantId: authResult.session.tenantId,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      });

      this.logger.log(`Token refreshed for identity: ${authResult.session.identityId}`);

      return this.mapDomainResultToResponse(authResult);
    } catch (error) {
      this.logger.error('Token refresh failed:', error);
      await this.auditService.recordAuthFailure({
        eventType: 'refresh_failure',
        failureReason: 'Token refresh failed',
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      });

      throw new UnauthorizedException('Token refresh failed');
    }
  }

  /**
   * Logs out by revoking the session.
   *
   * @param params - Logout parameters
   *
   * @remarks
   * - Revokes session in database
   * - Records logout for audit trail
   * - Graceful handling of invalid tokens
   */
  async logout(params: {
    refreshToken: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    try {
      // Validate refresh token to get session info
      const tokenPayload = await this.domainAuthService['tokenService'].validateRefreshToken(params.refreshToken);

      // Revoke session
      await this.prisma.db.session.updateMany({
        where: {
          identityId: tokenPayload.identityId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });

      // Record logout
      await this.auditService.recordLogout({
        identityId: tokenPayload.identityId,
        accountId: tokenPayload.accountId,
        scope: tokenPayload.scope,
        tenantId: tokenPayload.tenantId,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      });

      this.logger.log(`Identity logged out: ${tokenPayload.identityId}`);
    } catch (error) {
      this.logger.warn('Logout error (token may be invalid):', error);
    }
  }

  /**
   * Maps domain authentication result to API response.
   *
   * @param result - Domain authentication result
   * @returns API response format
   */
  private mapDomainResultToResponse(result: AuthenticationResult): AuthResponse {
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      tokenType: "Bearer",
      expiresIn: 900, // 15 minutes
      refreshExpires: 604800, // 7 days
      user: {
        identityId: result.session.identityId,
        accountId: result.session.accountId,
        sessionId: result.session.id,
        scopeCode: result.session.scope,
        tenantId: result.session.tenantId,
      },
    };
  }

  /**
   * Validates scope and tenant context compatibility.
   *
   * @param scope - The scope being validated
   * @param tenantId - The tenant context
   *
   * @throws UnauthorizedException - When scope and context are incompatible
   */
  private validateScopeContext(scope: string, tenantId?: string): void {
    switch (scope) {
      case 'platform':
        if (tenantId) {
          throw new UnauthorizedException('Platform scope cannot have tenant context');
        }
        break;
      case 'tenant':
        if (!tenantId) {
          throw new UnauthorizedException('Tenant scope requires tenant context');
        }
        break;
      case 'customer':
        // Customer scope can operate with or without tenant context
        break;
      default:
        throw new UnauthorizedException('Invalid scope');
    }
  }
}
