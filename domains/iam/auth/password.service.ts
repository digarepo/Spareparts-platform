import { webcrypto } from 'node:crypto';
import * as argon2 from 'argon2';

/**
 * Password hashing and verification service.
 *
 * @remarks
 * - Uses argon2id for industry-standard security
 * - Configured for OWASP recommendations
 * - Separate pepper can be added via environment
 */
export class PasswordService {
    private readonly hashOptions: argon2.Options;

    constructor() {
        this.hashOptions = {
            type: argon2.argon2id,
            memoryCost: 65536,
            timeCost: 3,
            parallelism: 4,
            hashLength: 32,
        };
    }

    /**
     * Hashes a password with argon2id.
     *
     * @param password - Plain text password
     * @returns Hashed password with salt
     *
     * @remarks
     * - Includes salt automatically
     * - Uses memory-hard function to resist GPU attacks
     */
    async hashPassword(password: string): Promise<string>{
        return await argon2.hash(password, this.hashOptions);
    }

    /**
     * Verifies a password against a hash.
     *
     * @param password - Plain text password to verify
     * @param hash - Hashed password to verify against
     * @returns true if password matches
     *
     * @remarks
     * - Constant-time comparison to prevent timing attacks
     * - Automatically extracts salt from hash
     */
    async verifyPassword(password: string, hash: string): Promise<boolean>{
        try {
            return await argon2.verify(hash, password);
        } catch {
            return false;
        }
    }

    /**
     * Generates a cryptographically secure random password.
     * Uses Rejection Sampling to eliminate Modulo Bias.
     */
    generateSecurePassword(length: number = 16): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        const charsLength = chars.length;

        const maxValidByte = 256 - (256 % charsLength);
        const tempBuffer = new Uint8Array(1);
        let password = '';

        while (password.length < length) {
            webcrypto.getRandomValues(tempBuffer);
            const val = tempBuffer[0];

            if (val !== undefined && val < maxValidByte) {
                const char = chars[val % charsLength];
                if (char) {
                    password += char;
                }
            }
        }

        return password;
    }
}
