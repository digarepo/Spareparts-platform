import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from '../../src/auth/auth.service';


describe('Refresh Token Grace Period (Race Condition)', () => {
  let authService: AuthService;
  let mockPrismaService: any;
  let mockAuditService: any;
  let mockDomainAuthService: any;

  beforeEach(() => {
    mockPrismaService = {
      db: {
        $transaction: vi.fn(),
        session: {
          findFirst: vi.fn(),
          create: vi.fn(),
          updateMany: vi.fn(),
        },
        identity: {
          findUnique: vi.fn(),
        },
        account: {
          findFirst: vi.fn(),
        },
      },
    };

    mockAuditService = {
      recordAuthSuccess: vi.fn(),
      recordAuthFailure: vi.fn(),
      recordLogout: vi.fn(),
    };

    mockDomainAuthService = {
      authenticate: vi.fn(),
      rotateRefreshToken: vi.fn(),
      passwordService: {
        hashPassword: vi.fn(),
      },
      tokenService: {
        validateRefreshToken: vi.fn(),
      },
    };

    authService = new AuthService(mockPrismaService, mockAuditService);
    (authService as any).domainAuthService = mockDomainAuthService;
  });

  /**
   * Scenario Description: Tests the "double-tap" refresh scenario where a client
   * sends two refresh requests simultaneously. The first should succeed, the second
   * should be handled gracefully within the 30-second grace period.
   */
  it('should handle double-tap refresh within grace period', async () => {
    // Arrange: Setup initial successful refresh
    const refreshToken = 'valid_refresh_token';
    const tokenPayload = {
      identityId: 'ident_123',
      accountId: 'acct_123',
      scope: 'tenant',
      tenantId: 'tenant_123',
      tokenFamily: 'family_123'
    };

    const currentSession = {
      id: 'session_123',
      identityId: 'ident_123',
      accountId: 'acct_123',
      revokedAt: new Date(Date.now() - 15000), // Revoked 15 seconds ago
      createdAt: new Date(Date.now() - 60000),
    };

    const newAuthResult = {
      accessToken: 'new_access_token',
      refreshToken: 'new_refresh_token',
      session: {
        id: 'session_124',
        identityId: 'ident_123',
        accountId: 'acct_123',
        scope: 'tenant',
        tenantId: 'tenant_123',
        expiresAt: new Date(Date.now() + 900000),
      }
    };

    // Mock token validation
    mockDomainAuthService.tokenService.validateRefreshToken
      .mockResolvedValue(tokenPayload);

    // Mock finding current session (recently revoked)
    mockPrismaService.db.session.findFirst
      .mockResolvedValueOnce(currentSession)
      .mockResolvedValueOnce(null); // No newer session found

    // Mock domain service refresh
    mockDomainAuthService.rotateRefreshToken
      .mockResolvedValue(newAuthResult);

    // Mock creating new session
    mockPrismaService.db.session.create
      .mockResolvedValue({ id: 'session_124' });

    // Act: Perform refresh during grace period
    const result = await authService.refreshToken({
      refreshToken,
      ipAddress: '127.0.0.1',
      userAgent: 'test-agent'
    });

    // Assert: Should succeed due to grace period
    expect(result.accessToken).toBe('new_access_token');
    expect(result.refreshToken).toBe('new_refresh_token');

    // Verify session revocation was skipped due to race condition
    expect(mockPrismaService.db.session.updateMany).not.toHaveBeenCalled();

    // Verify audit logging
    expect(mockAuditService.recordAuthSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'refresh_success',
        identityId: 'ident_123'
      })
    );
  });

  /**
   * Scenario Description: Tests that a second refresh request fails when a newer
   * session already exists, indicating the race condition was already resolved.
   */
  it('should reject refresh when newer session exists', async () => {
    // Arrange: Setup race condition with newer session
    const refreshToken = 'valid_refresh_token';
    const tokenPayload = {
      identityId: 'ident_123',
      accountId: 'acct_123',
      scope: 'tenant',
      tenantId: 'tenant_123',
      tokenFamily: 'family_123'
    };

    const currentSession = {
      id: 'session_123',
      identityId: 'ident_123',
      accountId: 'acct_123',
      revokedAt: new Date(Date.now() - 15000), // Revoked 15 seconds ago
      createdAt: new Date(Date.now() - 60000),
    };

    const newerSession = {
      id: 'session_124',
      createdAt: new Date(Date.now() - 30000), // Created after current session
    };

    // Mock token validation
    mockDomainAuthService.tokenService.validateRefreshToken
      .mockResolvedValue(tokenPayload);

    // Mock finding current session and newer session
    mockPrismaService.db.session.findFirst
      .mockResolvedValueOnce(currentSession) // First call - current session
      .mockResolvedValueOnce(newerSession);  // Second call - newer session found

    // Act & Assert: Should reject due to newer session
    await expect(authService.refreshToken({
      refreshToken,
      ipAddress: '127.0.0.1',
      userAgent: 'test-agent'
    })).rejects.toThrow('Token refresh failed');

    // Verify no new tokens were issued
    expect(mockDomainAuthService.rotateRefreshToken).not.toHaveBeenCalled();
    expect(mockPrismaService.db.session.create).not.toHaveBeenCalled();
  });

  /**
   * Scenario Description: Tests normal refresh flow without race conditions.
   * This ensures the grace period logic doesn't interfere with normal operations.
   */
  it('should handle normal refresh without race condition', async () => {
    // Arrange: Setup normal refresh (no recent revocation)
    const refreshToken = 'valid_refresh_token';
    const tokenPayload = {
      identityId: 'ident_123',
      accountId: 'acct_123',
      scope: 'tenant',
      tenantId: 'tenant_123',
      tokenFamily: 'family_123'
    };

    const currentSession = {
      id: 'session_123',
      identityId: 'ident_123',
      accountId: 'acct_123',
      revokedAt: null, // Not revoked
      createdAt: new Date(Date.now() - 60000),
    };

    const newAuthResult = {
      accessToken: 'new_access_token',
      refreshToken: 'new_refresh_token',
      session: {
        id: 'session_124',
        identityId: 'ident_123',
        accountId: 'acct_123',
        scope: 'tenant',
        tenantId: 'tenant_123',
        expiresAt: new Date(Date.now() + 900000),
      }
    };

    // Mock token validation
    mockDomainAuthService.tokenService.validateRefreshToken
      .mockResolvedValue(tokenPayload);

    // Mock finding current session (not revoked)
    mockPrismaService.db.session.findFirst
      .mockResolvedValue(currentSession);

    // Mock domain service refresh
    mockDomainAuthService.rotateRefreshToken
      .mockResolvedValue(newAuthResult);

    // Mock creating new session and revoking old ones
    mockPrismaService.db.session.create
      .mockResolvedValue({ id: 'session_124' });
    mockPrismaService.db.session.updateMany
      .mockResolvedValue({ count: 1 });

    // Act: Perform normal refresh
    const result = await authService.refreshToken({
      refreshToken,
      ipAddress: '127.0.0.1',
      userAgent: 'test-agent'
    });

    // Assert: Should succeed normally
    expect(result.accessToken).toBe('new_access_token');

    // Verify old sessions were revoked (normal flow)
    expect(mockPrismaService.db.session.updateMany).toHaveBeenCalledWith({
      where: {
        identityId: 'ident_123',
        accountId: 'acct_123',
        revokedAt: null,
        id: { not: 'session_124' },
      },
      data: {
        revokedAt: expect.any(Date),
      },
    });
  });

  /**
   * Scenario Description: Tests that refresh requests outside the 30-second grace
   * period are rejected normally.
   */
  it('should reject refresh outside grace period', async () => {
    // Arrange: Setup expired grace period
    const refreshToken = 'valid_refresh_token';
    const tokenPayload = {
      identityId: 'ident_123',
      accountId: 'acct_123',
      scope: 'tenant',
      tenantId: 'tenant_123',
      tokenFamily: 'family_123'
    };

    const currentSession = {
      id: 'session_123',
      identityId: 'ident_123',
      accountId: 'acct_123',
      revokedAt: new Date(Date.now() - 45000), // Revoked 45 seconds ago
      createdAt: new Date(Date.now() - 120000),
    };

    // Mock token validation
    mockDomainAuthService.tokenService.validateRefreshToken
      .mockResolvedValue(tokenPayload);

    // Mock finding current session (revoked outside grace period)
    mockPrismaService.db.session.findFirst
      .mockResolvedValue(null); // No session found (outside grace period)

    // Act & Assert: Should reject
    await expect(authService.refreshToken({
      refreshToken,
      ipAddress: '127.0.0.1',
      userAgent: 'test-agent'
    })).rejects.toThrow('Token refresh failed');

    // Verify audit logging for failure
    expect(mockAuditService.recordAuthFailure).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'refresh_failure',
        failureReason: 'Token refresh failed'
      })
    );
  });
});
