import { Module } from '@nestjs/common';
import { vi } from 'vitest';
import { PrismaService } from '../../src/prisma/prisma.service';
import { AuthService } from '../../src/auth/auth.service';
import { AuthGuard } from '../../src/auth/guards/auth.guard';
import { ScopesGuard } from '../../src/auth/guards/scopes.guard';
import { TokenService } from '../../src/infrastructure/token.service';
import { PasswordService } from '../../src/infrastructure/password.service';
import { AuditService } from '../../src/auth/audit.service';
import { withAuthContext, AuthContextManager } from '../../src/prisma/auth-context.extension';
import { createMockPrismaService, createPrismaClient } from './prisma-mock';

/**
 * Test Auth Module that provides all necessary providers for E2E testing
 */
@Module({
  providers: [
    // Mock PrismaService
    {
      provide: PrismaService,
      useFactory: () => {
        const mockService = createMockPrismaService();
        // Apply the auth context extension
        const extendedClient = withAuthContext(mockService.db);
        return {
          ...mockService,
          db: extendedClient,
          setAuthContext: (context: any) => {
            AuthContextManager.setContext(context);
          },
          getAuthContext: () => AuthContextManager.getContext(),
        };
      },
    },

    // Mock TokenService
    {
      provide: TokenService,
      useFactory: () => ({
        validateAccessToken: vi.fn().mockImplementation(async (token: string) => {
          if (token === 'valid_access_token') {
            return {
              identityId: 'ident_123',
              accountId: 'acct_123',
              scope: 'tenant',
              tenantId: 'tenant_123',
            };
          }
          if (token === 'platform_access_token') {
            return {
              identityId: 'ident_platform',
              accountId: 'acct_platform',
              scope: 'platform',
              tenantId: undefined,
            };
          }
          if (token === 'customer_access_token') {
            return {
              identityId: 'ident_customer',
              accountId: 'acct_customer',
              scope: 'customer',
              tenantId: 'tenant_123',
            };
          }
          throw new Error('Invalid token');
        }),

        validateRefreshToken: vi.fn().mockImplementation(async (token: string) => {
          if (token === 'valid_refresh_token') {
            return {
              identityId: 'ident_123',
              accountId: 'acct_123',
              tokenFamily: 'family_123',
            };
          }
          throw new Error('Invalid refresh token');
        }),

        generateTokens: vi.fn().mockResolvedValue({
          accessToken: 'new_access_token',
          refreshToken: 'new_refresh_token',
          expiresIn: 3600,
        }),
      }),
    },

    // Mock PasswordService
    {
      provide: PasswordService,
      useFactory: () => ({
        hashPassword: vi.fn().mockResolvedValue({
          hash: 'hashed_password',
          version: { version: 2, algorithm: 'argon2id', deprecated: false },
          createdAt: new Date(),
        }),

        verifyPassword: vi.fn().mockImplementation(async (password: string, hash: string) => {
          return password === 'correct_password';
        }),

        needsRehash: vi.fn().mockReturnValue(false),
        upgradeHash: vi.fn().mockResolvedValue({
          hash: 'upgraded_hash',
          version: { version: 2, algorithm: 'argon2id', deprecated: false },
          createdAt: new Date(),
        }),
      }),
    },

    // Mock AuditService
    {
      provide: AuditService,
      useFactory: () => ({
        recordAuthSuccess: vi.fn().mockResolvedValue(undefined),
        recordAuthFailure: vi.fn().mockResolvedValue(undefined),
        recordAuthEvent: vi.fn().mockResolvedValue(undefined),
      }),
    },

    // Mock Domain Services
    {
      provide: 'DomainAuthService',
      useFactory: () => ({
        register: vi.fn().mockResolvedValue({
          identity: { id: 'ident_123', email: 'test@example.com' },
          account: { id: 'acct_123', scopeCode: 'tenant' },
          session: { id: 'session_123', expiresAt: new Date() },
        }),

        authenticate: vi.fn().mockResolvedValue({
          identity: { id: 'ident_123', email: 'test@example.com' },
          account: { id: 'acct_123', scopeCode: 'tenant' },
        }),

        rotateRefreshToken: vi.fn().mockResolvedValue({
          session: { id: 'new_session_123', expiresAt: new Date() },
          accessToken: 'new_access_token',
          refreshToken: 'new_refresh_token',
        }),
      }),
    },

    // Real AuthService with mocked dependencies
    AuthService,

    // Guards
    AuthGuard,
    ScopesGuard,
  ],
  exports: [AuthService, PrismaService],
})
export class TestAuthModule {}

/**
 * Factory function to create test tokens
 */
export const createTestToken = (type: 'tenant' | 'platform' | 'customer') => {
  switch (type) {
    case 'tenant':
      return 'valid_access_token';
    case 'platform':
      return 'platform_access_token';
    case 'customer':
      return 'customer_access_token';
    default:
      return 'valid_access_token';
  }
};

/**
 * Factory function to create test refresh tokens
 */
export const createTestRefreshToken = () => 'valid_refresh_token';
