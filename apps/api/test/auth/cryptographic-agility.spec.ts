import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PasswordService } from '../../src/infrastructure/password.service';

describe('Cryptographic Agility', () => {
  let passwordService: PasswordService;
  let mockDomainPasswordService: any;
  let mockLogger: any;

  beforeEach(() => {
    mockLogger = {
      log: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
    };

    mockDomainPasswordService = {
      hashPassword: vi.fn(),
      verifyPassword: vi.fn(),
      generateSecurePassword: vi.fn(),
    };

    passwordService = new PasswordService(mockDomainPasswordService, mockLogger);
  });

  /**
   * Scenario Description: Tests that the needsRehash method correctly identifies
   * outdated password hash versions that need upgrading.
   */
  it('should identify outdated password hash versions', async () => {
    // Arrange: Create outdated version (version 1 when current is version 2)
    const outdatedVersion = {
      algorithm: 'argon2id' as const,
      version: 1,
      parameters: {
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
        saltLength: 16,
        hashLength: 32
      },
      deprecated: false
    };

    // Act: Check if rehash is needed
    const needsRehash = passwordService.needsRehash(outdatedVersion);

    // Assert: Should need rehash
    expect(needsRehash).toBe(true);
  });

  /**
   * Scenario Description: Tests that deprecated hash versions are flagged for rehashing.
   * This validates the deprecation detection mechanism.
   */
  it('should identify deprecated password hash versions', async () => {
    // Arrange: Create deprecated version
    const deprecatedVersion = {
      algorithm: 'argon2id' as const,
      version: 1,
      parameters: {
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
        saltLength: 16,
        hashLength: 32
      },
      deprecated: true,
      deprecationDate: new Date('2024-01-01')
    };

    // Act: Check if rehash is needed
    const needsRehash = passwordService.needsRehash(deprecatedVersion);

    // Assert: Should need rehash due to deprecation
    expect(needsRehash).toBe(true);
  });

  /**
   * Scenario Description: Tests that current password hash versions don't need rehashing.
   * This validates that up-to-date hashes are correctly identified.
   */
  it('should not require rehash for current version', async () => {
    // Arrange: Get current version
    const currentVersion = passwordService.getCurrentVersion();

    // Act: Check if rehash is needed
    const needsRehash = passwordService.needsRehash(currentVersion);

    // Assert: Should not need rehash
    expect(needsRehash).toBe(false);
  });

  /**
   * Scenario Description: Tests the password hash upgrade process.
   * This validates that outdated hashes can be successfully upgraded.
   */
  it('should upgrade password hash to current version', async () => {
    // Arrange: Setup outdated hash and password
    const password = 'testPassword123';
    const outdatedHash = {
      hash: '$argon2id$v=19$m=65536,t=3,p=4$...',
      version: {
        algorithm: 'argon2id' as const,
        version: 1,
        parameters: {
          memoryCost: 65536,
          timeCost: 3,
          parallelism: 4,
          saltLength: 16,
          hashLength: 32
        },
        deprecated: false
      },
      createdAt: new Date('2024-01-01')
    };

    const newHash = '$argon2id$v=19$m=131072,t=4,p=4$...';
    mockDomainPasswordService.hashPassword.mockResolvedValue(newHash);

    // Act: Upgrade hash
    const result = await passwordService.upgradeHash(password, outdatedHash);

    // Assert: Should return upgraded hash with current version
    expect(result.hash).toBe(newHash);
    expect(result.version.version).toBe(2); // Current version
    expect(result.version.parameters.memoryCost).toBe(131072); // Upgraded parameters
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.createdAt.getTime()).toBeGreaterThan(Date.now() - 1000);

    // Verify logging
    expect(mockLogger.log).toHaveBeenCalledWith(
      'Upgrading password hash',
      expect.objectContaining({
        fromVersion: 1,
        toVersion: 2,
        algorithm: 'argon2id'
      })
    );
  });

  /**
   * Scenario Description: Tests version support information retrieval.
   * This validates that the service can report all supported versions.
   */
  it('should provide supported version information', async () => {
    // Act: Get supported versions
    const supportedVersions = passwordService.getSupportedVersions();
    const currentVersion = passwordService.getCurrentVersion();

    // Assert: Should return version information
    expect(supportedVersions).toHaveLength(2);
    expect(supportedVersions[0]?.version).toBe(1);
    expect(supportedVersions[1]?.version).toBe(2);
    expect(currentVersion.version).toBe(2);
    expect(currentVersion.algorithm).toBe('argon2id');
    expect(currentVersion.parameters.memoryCost).toBe(131072);
  });

  /**
   * Scenario Description: Tests password hashing with specific version.
   * This validates explicit version selection for hashing.
   */
  it('should hash password with specific version', async () => {
    // Arrange: Setup specific version and password
    const password = 'testPassword123';
    const specificVersion = {
      algorithm: 'argon2id' as const,
      version: 1,
      parameters: {
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
        saltLength: 16,
        hashLength: 32
      },
      deprecated: false
    };

    const expectedHash = '$argon2id$v=19$m=65536,t=3,p=4$...';
    mockDomainPasswordService.hashPassword.mockResolvedValue(expectedHash);

    // Act: Hash with specific version
    const result = await passwordService.hashPassword(password, specificVersion);

    // Assert: Should use specified version
    expect(result.hash).toBe(expectedHash);
    expect(result.version).toBe(specificVersion);
    expect(result.createdAt).toBeInstanceOf(Date);

    // Verify logging
    expect(mockLogger.log).toHaveBeenCalledWith(
      'Hashing password with versioned algorithm',
      expect.objectContaining({
        algorithm: 'argon2id',
        version: 1,
        passwordLength: password.length
      })
    );
  });

  /**
   * Scenario Description: Tests password hashing with default current version.
   * This validates automatic current version usage.
   */
  it('should hash password with current version by default', async () => {
    // Arrange: Setup password and mock
    const password = 'testPassword123';
    const expectedHash = '$argon2id$v=19$m=131072,t=4,p=4$...';
    mockDomainPasswordService.hashPassword.mockResolvedValue(expectedHash);

    // Act: Hash without specifying version
    const result = await passwordService.hashPassword(password);

    // Assert: Should use current version
    expect(result.hash).toBe(expectedHash);
    expect(result.version.version).toBe(2); // Current version
    expect(result.version.parameters.memoryCost).toBe(131072);
  });

  /**
   * Scenario Description: Tests error handling during hash upgrade.
   * This validates graceful failure handling.
   */
  it('should handle hash upgrade failures gracefully', async () => {
    // Arrange: Setup upgrade failure
    const password = 'testPassword123';
    const outdatedHash = {
      hash: 'old_hash',
      version: {
        algorithm: 'argon2id' as const,
        version: 1,
        parameters: {
          memoryCost: 65536,
          timeCost: 3,
          parallelism: 4,
          saltLength: 16,
          hashLength: 32
        },
        deprecated: false
      },
      createdAt: new Date('2024-01-01')
    };

    mockDomainPasswordService.hashPassword.mockRejectedValue(new Error('Hashing failed'));

    // Act & Assert: Should throw error
    await expect(passwordService.upgradeHash(password, outdatedHash))
      .rejects.toThrow('Password hashing failed');

    // Verify error logging
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Password hashing failed',
      expect.objectContaining({
        passwordLength: 15,
        stack: expect.stringContaining('Hashing failed'),
        version: 2
      })
    );
  });

  /**
   * Scenario Description: Tests future algorithm support structure.
   * This validates the extensibility for new hashing algorithms.
   */
  it('should support future algorithm extensibility', async () => {
    // Arrange: Get current supported versions
    const supportedVersions = passwordService.getSupportedVersions();

    // Act & Assert: Verify structure supports future algorithms
    supportedVersions.forEach(version => {
      expect(version.algorithm).toBeDefined();
      expect(version.version).toBeGreaterThan(0);
      expect(version.parameters).toBeDefined();
      expect(['argon2id', 'bcrypt', 'scrypt']).toContain(version.algorithm);
    });

    // Verify current version is always the latest non-deprecated
    const currentVersion = passwordService.getCurrentVersion();
    const maxVersion = Math.max(...supportedVersions
      .filter(v => !v.deprecated)
      .map(v => v.version));
    expect(currentVersion.version).toBe(maxVersion);
  });
});
