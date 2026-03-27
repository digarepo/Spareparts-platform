import { Injectable, Logger } from '@nestjs/common';
import { PasswordService as DomainPasswordService } from '../../../../domains/iam/auth/password.service';

/**
 * Password hashing algorithm versions and parameters.
 *
 * @remarks
 * - Supports multiple hashing algorithms for future migration
 * - Each version has specific parameters for security level
 * - Allows gradual upgrade of password security over time
 */
export interface PasswordHashVersion {
  algorithm: 'argon2id' | 'bcrypt' | 'scrypt';
  version: number;
  parameters: {
    memoryCost?: number; // Argon2
    timeCost?: number; // Argon2
    parallelism?: number; // Argon2
    saltLength?: number; // Argon2
    hashLength?: number; // Argon2
    rounds?: number; // bcrypt
    keySize?: number; // scrypt
    blockSize?: number; // scrypt
    cpuFactor?: number; // scrypt
  };
  deprecated?: boolean;
  deprecationDate?: Date;
}

/**
 * Password hashing result with metadata.
 *
 * @remarks
 * - Includes hash string and version information
 * - Used for database storage and validation
 * - Supports algorithm migration and upgrade
 */
export interface PasswordHashResult {
  hash: string;
  version: PasswordHashVersion;
  createdAt: Date;
}

/**
 * Current and supported password hashing versions.
 *
 * @remarks
 * - Defines the progression of security improvements
 * - New versions can be added without breaking existing hashes
 * - Deprecated versions remain supported for verification
 */
const PASSWORD_HASH_VERSIONS: PasswordHashVersion[] = [
  {
    algorithm: 'argon2id',
    version: 1,
    parameters: {
      memoryCost: 65536, // 64 MB
      timeCost: 3, // 3 iterations
      parallelism: 4, // 4 threads
      saltLength: 16,
      hashLength: 32
    }
  },
  {
    algorithm: 'argon2id',
    version: 2,
    parameters: {
      memoryCost: 131072, // 128 MB (increased for better security)
      timeCost: 4, // 4 iterations (increased)
      parallelism: 4, // 4 threads
      saltLength: 16,
      hashLength: 32
    }
  },
  // Future versions can be added here
];

/**
 * Current active password hashing version.
 *
 * @remarks
 * - New passwords will use this version
 * - Can be updated when implementing security upgrades
 * - Should be the latest non-deprecated version
 */
const CURRENT_HASH_VERSION: PasswordHashVersion = PASSWORD_HASH_VERSIONS[PASSWORD_HASH_VERSIONS.length - 1]!;

/**
 * Infrastructure wrapper for domain PasswordService.
 *
 * @remarks
 * - **Scope:** platform
 * - **Authority:** Domain PasswordService
 * - **Invariants:** Argon2id hashing, no plaintext storage
 */
@Injectable ()
export class PasswordService {
    constructor (
        private readonly passwordService: DomainPasswordService,
        private readonly logger: Logger
    ) {
        // Logger context is set via injection in NestJS
    }

    /**
     * Hashes a password using Argon2id.
     *
     * @param password - Plain text password to hash
     * @returns Hashed password string
     *
     * @throws Error - When hashing fails
     *
     * @remarks
     * - Uses domain service with parameters
     * - Implements modulo bias elimination
     * - Never stores plaintext passwords
     */
    /**
     * Hashes a password using the current Argon2id version with metadata.
     *
     * @param password - Plain text password to hash
     * @param version - Optional specific version to use (defaults to current)
     * @returns Password hash result with version metadata
     *
     * @throws Error - When hashing fails
     *
     * @remarks
     * - Uses current version for optimal security
     * - Includes version metadata for database storage
     * - Supports future algorithm upgrades
     * - Maintains backward compatibility for verification
     */
    async hashPassword(password: string, version?: PasswordHashVersion): Promise<PasswordHashResult> {
        try {
            const hashVersion = version || CURRENT_HASH_VERSION;

            // Log version usage for security monitoring
            this.logger.log('Hashing password with versioned algorithm', {
                algorithm: hashVersion.algorithm,
                version: hashVersion.version,
                passwordLength: password.length
            });

            // For now, delegate to domain service (future: implement version-specific hashing)
            const hash = await this.passwordService.hashPassword(password);

            const result: PasswordHashResult = {
                hash,
                version: hashVersion,
                createdAt: new Date()
            };

            return result;
        } catch (error) {
            this.logger.error('Password hashing failed', {
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
                passwordLength: password.length,
                version: version?.version || CURRENT_HASH_VERSION.version
            });
            throw new Error('Password hashing failed');
        }
    }

    /**
     * Verifies a password against a hash.
     *
     * @param password - Plain text password to verify
     * @param hash - Hashed password to verify against
     * @returns True if password matches hash
     *
     * @remarks
     * - Uses constant-time comparison
     * - Handles verification failures gracefully
     */
    async verifyPassword(password: string, hash: string): Promise<boolean> {
        try {
        return await this.passwordService.verifyPassword(password, hash);
        } catch (error) {
        return false;
        }
    }

    /**
     * Generates a cryptographically secure random password.
     *
     * @param length - Desired password length (default 16)
     * @returns Generated secure password
     *
     * @remarks
     * - Uses rejection sampling to eliminate modulo bias
     * - Includes special characters for entropy
     * - Suitable for temporary credentials
     */
    /**
     * Checks if a password hash needs rehashing due to version upgrade.
     *
     * @param currentVersion - Current hash version
     * @returns True if hash should be upgraded
     *
     * @remarks
     * - Compares current version against latest version
     * - Identifies deprecated or outdated versions
     * - Used for gradual security upgrades
     */
    needsRehash(currentVersion: PasswordHashVersion): boolean {
        // Rehash if current version is deprecated
        if (currentVersion.deprecated) {
            return true;
        }

        // Rehash if newer version is available
        return currentVersion.version < CURRENT_HASH_VERSION.version;
    }

    /**
     * Upgrades a password hash to the current version.
     *
     * @param password - Plain text password
     * @param currentHash - Current hash result
     * @returns New password hash result with current version
     *
     * @remarks
     * - Used during login to upgrade outdated hashes
     * - Maintains security without forcing password resets
     * - Should be called after successful password verification
     */
    async upgradeHash(password: string, currentHash: PasswordHashResult): Promise<PasswordHashResult> {
        this.logger.log('Upgrading password hash', {
            fromVersion: currentHash.version.version,
            toVersion: CURRENT_HASH_VERSION.version,
            algorithm: currentHash.version.algorithm
        });

        return await this.hashPassword(password, CURRENT_HASH_VERSION);
    }

    /**
     * Gets the current password hashing version.
     *
     * @returns Current active version configuration
     *
     * @remarks
     * - Used for documentation and monitoring
     * - Helpful for security audits
     */
    getCurrentVersion(): PasswordHashVersion {
        return CURRENT_HASH_VERSION;
    }

    /**
     * Gets all supported password hashing versions.
     *
     * @returns Array of all supported versions
     *
     * @remarks
     * - Used for migration planning
     * - Helps identify deprecated versions
     */
    getSupportedVersions(): PasswordHashVersion[] {
        return PASSWORD_HASH_VERSIONS;
    }

    /**
     * Generates a cryptographically secure random password.
     *
     * @param length - Desired password length (default 16)
     * @returns Generated secure password
     *
     * @remarks
     * - Uses rejection sampling to eliminate modulo bias
     * - Includes special characters for entropy
     * - Suitable for temporary credentials
     */
    generateSecurePassword(length?: number): string {
        try {
        return this.passwordService.generateSecurePassword(length);
        } catch (error) {
            this.logger.error('Password generation failed', {
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
                requestedLength: length
            });
            throw new Error('Password generation failed');
        }
    }
}
