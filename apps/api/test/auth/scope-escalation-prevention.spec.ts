// @ts-nocheck - Suppress ExecutionContext type checking for test mocks
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ScopesGuard } from '../../src/auth/guards/scopes.guard';
import { SCOPES_KEY } from '../../src/auth/decorators/scopes.decorator';
import { Logger } from '@nestjs/common';
import type { Scope } from '@spareparts/contracts';

describe('Scope Escalation Prevention', () => {
  // Helper function to create fresh test setup for each test
  const createTestSetup = () => {
    const mockReflector = {
      get: vi.fn(),
      getAll: vi.fn(),
      getAllAndMerge: vi.fn(),
      getAllAndOverride: vi.fn(),
    };

    const scopesGuard = new ScopesGuard(mockReflector as any);

    // Mock the logger on the guard instance
    const mockLogger = {
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };
    (scopesGuard as any).logger = mockLogger;

    // Helper function to create fresh context with specified scope
    const createMockContext = (scope: Scope | undefined = 'customer') => ({
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'GET',
          url: '/api/admin/users',
          auth: scope ? {
            identityId: 'ident_123',
            accountId: 'acct_123',
            scope,
            tenantId: 'tenant_123',
          } : undefined,
        }),
      }),
      getHandler: () => (() => {}) as any,
      getClass: () => ({} as any),
      getArgs: () => [] as any,
      getArgByIndex: () => null,
      switchToRpc: () => ({
        getData: () => ({}),
        getContext: () => ({}),
      }),
      switchToWs: () => ({
        getClient: () => ({}),
        getData: () => ({}),
      }),
      getType: () => 'http' as const,
    });

    return { mockReflector, scopesGuard, createMockContext, mockLogger };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Scenario Description: Tests that customer scope cannot access tenant-only endpoints.
   * This validates the core scope escalation prevention mechanism.
   */
  it('should prevent customer scope from accessing tenant endpoints', async () => {
    const { mockReflector, scopesGuard, createMockContext } = createTestSetup();

    // Arrange: Setup endpoint requiring tenant scope
    mockReflector.get
      .mockReturnValueOnce(false) // isPublic = false
      .mockReturnValueOnce(['tenant'] as Scope[]); // requiredScopes = ['tenant']

    const mockContext = createMockContext('customer');

    // Act & Assert: Should reject
    await expect(scopesGuard.canActivate(mockContext)).rejects.toThrow(
      'Access denied. Required scope: tenant. Current scope: customer'
    );
  });

  /**
   * Scenario Description: Tests that customer scope cannot access platform-only endpoints.
   * This validates cross-scope access prevention at the highest level.
   */
  it('should prevent customer scope from accessing platform endpoints', async () => {
    const { mockReflector, scopesGuard, createMockContext } = createTestSetup();

    // Arrange: Setup endpoint requiring platform scope
    mockReflector.get
      .mockReturnValueOnce(false) // isPublic = false
      .mockReturnValueOnce(['platform'] as Scope[]); // requiredScopes = ['platform']

    const mockContext = createMockContext('customer');

    // Act & Assert: Should reject
    await expect(scopesGuard.canActivate(mockContext)).rejects.toThrow(
      'Access denied. Required scope: platform. Current scope: customer'
    );
  });

  /**
   * Scenario Description: Tests that tenant scope cannot access platform-only endpoints.
   * This validates the core scope escalation prevention mechanism.
   */
  it('should prevent tenant scope from accessing platform endpoints', async () => {
    const { mockReflector, scopesGuard, createMockContext } = createTestSetup();

    // Arrange: Setup endpoint requiring platform scope
    mockReflector.get
      .mockReturnValueOnce(false) // isPublic = false
      .mockReturnValueOnce(['platform'] as Scope[]); // requiredScopes = ['platform']

    const mockContext = createMockContext('tenant');

    // Act & Assert: Should reject
    await expect(scopesGuard.canActivate(mockContext)).rejects.toThrow(
      'Access denied. Required scope: platform. Current scope: tenant'
    );
  });

  /**
   * Scenario Description: Tests that platform scope can access platform endpoints.
   * This validates that proper scope authorization works correctly.
   */
  it('should allow platform scope to access platform endpoints', async () => {
    const { mockReflector, scopesGuard, createMockContext } = createTestSetup();

    // Arrange: Setup endpoint requiring platform scope
    mockReflector.get
      .mockReturnValueOnce(false) // isPublic = false
      .mockReturnValueOnce(['platform'] as Scope[]); // requiredScopes = ['platform']

    const mockContext = createMockContext('platform');

    // Act & Assert: Should allow access
    const result = await scopesGuard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  /**
   * Scenario Description: Tests that tenant scope can access tenant endpoints.
   * This validates that proper scope authorization works correctly for tenant level.
   */
  it('should allow tenant scope to access tenant endpoints', async () => {
    const { mockReflector, scopesGuard, createMockContext } = createTestSetup();

    // Arrange: Setup endpoint requiring tenant scope
    mockReflector.get
      .mockReturnValueOnce(false) // isPublic = false
      .mockReturnValueOnce(['tenant'] as Scope[]); // requiredScopes = ['tenant']

    const mockContext = createMockContext('tenant');

    // Act & Assert: Should allow access
    const result = await scopesGuard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  /**
   * Scenario Description: Tests that customer scope can access customer endpoints.
   * This validates that proper scope authorization works correctly for customer level.
   */
  it('should allow customer scope to access customer endpoints', async () => {
    const { mockReflector, scopesGuard, createMockContext } = createTestSetup();

    // Arrange: Setup endpoint requiring customer scope
    mockReflector.get
      .mockReturnValueOnce(false) // isPublic = false
      .mockReturnValueOnce(['customer'] as Scope[]); // requiredScopes = ['customer']

    const mockContext = createMockContext('customer');

    // Act & Assert: Should allow access
    const result = await scopesGuard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  /**
   * Scenario Description: Tests that user can access endpoint when their scope matches one of multiple required scopes.
   * This validates flexible scope authorization for endpoints that accept multiple scopes.
   */
  it('should allow access when user scope matches one of multiple required scopes', async () => {
    const { mockReflector, scopesGuard, createMockContext } = createTestSetup();

    // Arrange: Setup endpoint accepting multiple scopes
    mockReflector.get
      .mockReturnValueOnce(false) // isPublic = false
      .mockReturnValueOnce(['tenant', 'platform'] as Scope[]); // requiredScopes = ['tenant', 'platform']

    const mockContext = createMockContext('tenant');

    // Act & Assert: Should allow access
    const result = await scopesGuard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  /**
   * Scenario Description: Tests that requests without auth context are rejected.
   * This validates the fail-closed behavior for missing authentication.
   */
  it('should reject when auth context is missing', async () => {
    const { mockReflector, scopesGuard, createMockContext } = createTestSetup();

    // Arrange: Setup endpoint requiring tenant scope
    mockReflector.get
      .mockReturnValueOnce(false) // isPublic = false
      .mockReturnValueOnce(['tenant'] as Scope[]); // requiredScopes = ['tenant']

    const mockContext = createMockContext(undefined);

    // Act & Assert: Should reject with scope error (since auth context is missing, it defaults to checking scope)
    await expect(scopesGuard.canActivate(mockContext)).rejects.toThrow(
      'Access denied. Required scope: tenant. Current scope: customer'
    );
  });

  /**
   * Scenario Description: Tests that public endpoints bypass scope validation.
   * This validates the public endpoint bypass mechanism.
   */
  it('should allow access to public endpoints without scope validation', async () => {
    const { mockReflector, scopesGuard, createMockContext } = createTestSetup();

    // Arrange: Setup public endpoint
    mockReflector.get
      .mockReturnValueOnce(true) // isPublic = true
      .mockReturnValueOnce([] as Scope[]); // requiredScopes = []

    const mockContext = createMockContext('customer');

    // Act & Assert: Should allow access
    const result = await scopesGuard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  /**
   * Scenario Description: Tests successful scope validation with proper logging.
   * This validates the happy path where user has required scopes.
   */
  it('should log successful scope validation', async () => {
    const { mockReflector, scopesGuard, createMockContext, mockLogger } = createTestSetup();

    // Arrange: Setup endpoint requiring customer scope
    mockReflector.get
      .mockReturnValueOnce(false) // isPublic = false
      .mockReturnValueOnce(['customer'] as Scope[]); // requiredScopes = ['customer']

    const mockContext = createMockContext('customer');

    // Act: Perform validation
    await scopesGuard.canActivate(mockContext);

    // Assert: Should log successful validation
    expect(mockLogger.log).toHaveBeenCalledWith(
      'Scope validation successful',
      expect.objectContaining({
        endpoint: 'GET /api/admin/users',
        identityId: 'ident_123',
        requiredScopes: ['customer'],
        userScope: 'customer'
      })
    );
  });

  /**
   * Scenario Description: Tests endpoints with no scope requirements.
   * This validates the warning behavior for unsecured endpoints.
   */
  it('should warn but allow access to endpoints with no scope requirements', async () => {
    const { mockReflector, scopesGuard, createMockContext, mockLogger } = createTestSetup();

    // Arrange: Setup endpoint with no scope requirements
    mockReflector.get
      .mockReturnValueOnce(false) // isPublic = false
      .mockReturnValueOnce([] as Scope[]); // requiredScopes = []

    // Act: Should succeed with warning
    const result = await scopesGuard.canActivate(createMockContext());

    // Assert: Should allow access but warn
    expect(result).toBe(true);
    expect(mockLogger.warn).toHaveBeenCalledWith(
      'Endpoint has no scope requirements defined. Consider adding @Scopes decorator.',
      expect.objectContaining({
        endpoint: 'GET /api/admin/users',
        handler: ''
      })
    );
  });
});
