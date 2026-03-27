import { Injectable, Logger } from '@nestjs/common';
import { TokenService as DomainTokenService } from '../../../../domains/iam/auth/token.service';

/**
 * Infrastructure wrapper for domain TokenService.
 *
 * @remarks
 * - **Scope:** platform
 * - **Authority:** Domain TokenService
 * - **Invariants:** JWT handling, no business logic
 */
@Injectable()
export class TokenService {
    constructor(
        private readonly tokenService: DomainTokenService,
        private readonly logger: Logger
    ) {
        // Logger context is set via injection in NestJS
    }

    /**
     * Generates an access token for authenticated identity.
     *
     * @param payload - Token payload with identity and scope
     * @param expiresIn - Token expiration duration
     * @returns Signed JWT access token
     *
     * @throws Error - When token generation fails
     *
     * @remarks
     * - Uses domain service for cryptographic operations
     * - Maintains token format consistency
     */
    async generateAccessToken(payload: {
        identityId: string;
        accountId: string;
        scope: string;
        tenantId?: string;
    }, expiresIn?: string): Promise<string>{
        try {
            const typedPayload = {
                ...payload,
                scope: payload.scope as "platform" | "tenant" | "customer"
            }
            return await this.tokenService.generateAccessToken(typedPayload, expiresIn);
        } catch (error) {
            throw new Error('Access token generation failed');
        }
    }

    /**
     * Validates an access token and extracts payload.
     *
     * @param token - JWT access token to validate
     * @returns Extracted token payload
     *
     * @throws Error - When token is invalid or expired
     *
     * @remarks
     * - Uses domain service for JWT validation
     * - Enforces token format and signature
     */
    async validateAccessToken(token: string): Promise<{
        identityId: string;
        accountId: string;
        scope: string;
        tenantId?: string;
    }> {
        try {
            return await this.tokenService.validateAccessToken(token);
        } catch (error) {
            // Log detailed error for debugging while keeping generic response for client
            this.logger.error('JWT access token validation failed', {
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
                tokenLength: token.length,
                tokenPrefix: token.substring(0, 10) + '...'
            });
            throw new Error('Invalid access token');
        }
    }

    /**
     * Generates a refresh token for token rotation.
     *
     * @param payload - Token payload with identity and scope
     * @param tokenFamily - Token family identifier for rotation
     * @param expiresIn - Token expiration duration
     * @returns Signed JWT refresh token
     *
     * @remarks
     * - Supports secure token rotation strategy
     * - Links tokens to family for revocation tracking
     */
    async generateRefreshToken(payload: {
        identityId: string;
        accountId: string;
        scope: string;
        tenantId?: string;
    }, tokenFamily: string, expiresIn?: string): Promise<string> {
        try {

            const typedPayload = {
                ...payload,
                scope: payload.scope as "platform" | "tenant" | "customer"
            }
            return await this.tokenService.generateRefreshToken(typedPayload, tokenFamily, expiresIn);
        } catch (error) {
            throw new Error('Refresh token generation failed');
        }
    }

    /**
     * Validates a refresh token and extracts payload.
     *
     * @param token - JWT refresh token to validate
     * @returns Extracted token payload with family
     *
     * @throws Error - When token is invalid or expired
     *
     * @remarks
     * - Includes token family for rotation tracking
     * - Enforces refresh token format
     */
    async validateRefreshToken(token: string): Promise<{
        identityId: string;
        accountId: string;
        scope: string;
        tenantId?: string;
        tokenFamily: string;
    }> {
        try {
        return await this.tokenService.validateRefreshToken(token);
        } catch (error) {
            // Log detailed error for debugging while keeping generic response for client
            this.logger.error('JWT refresh token validation failed', {
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
                tokenLength: token.length,
                tokenPrefix: token.substring(0, 10) + '...'
            });
            throw new Error('Invalid refresh token');
        }
    }

    /**
     * Generates a new token family identifier.
     *
     * @returns ULID for token family tracking
     *
     * @remarks
     * - Uses domain service for ULID generation
     * - Ensures token family uniqueness
     */
    generateTokenFamily(): string {
        try {
        return this.tokenService.generateTokenFamily();
        } catch (error) {
        throw new Error('Token family generation failed');
        }
    }
}
