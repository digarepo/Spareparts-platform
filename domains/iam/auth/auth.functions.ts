import type { IdentityModel, AccountModel, SessionModel } from '../models';
import { canIdentityAuthenticate, canAccountAuthenticate } from '../models';
import type { Scope } from '@spareparts/contracts';
import { ULID, generateULID } from '@spareparts/contracts';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
// import { IdentityModel } from '../models';

/**
 * Authentication result payload.
 *
 * @remarks
 * - Contains tokens for client storage
 * - Includes session metadata
 * - Ready for API response
 */
export interface AuthenticationResult {
  accessToken: string;
  refreshToken: string;
  tokenFamily: ULID;
  session: {
    id: ULID;
    identityId: string;
    accountId: string;
    scope: Scope;
    tenantId?: string;
    expiresAt: Date;
  };
}

/**
 * Core authentication functions.
 *
 * @remarks
 * - Pure domain logic for authentication
 * - Establishes identity without authorization
 * - Handles lifecycle state validation
 */
export class AuthService {
    private readonly passwordService: PasswordService;
    private readonly tokenService: TokenService;

    constructor() {
        this.passwordService = new PasswordService();
        this.tokenService = new TokenService();
    }

    /**
     * Authenticates credentials and generates tokens.
     *
     * @param email - User email
     * @param password - Plain text password
     * @param identity - Identity from database
     * @param account - Account from database
     * @param passwordHash - Stored password hash
     * @returns Authentication result with tokens
     *
     * @throws Error if authentication fails
     *
     * @remarks
     * - Verifies password against stored hash
     * - Validates identity and account lifecycle
     * - Generates access and refresh tokens
     */
    async authenticate(
        email: string,
        password: string,
        identity: IdentityModel,
        account: AccountModel,
        passwordHash: string,
    ): Promise<AuthenticationResult> {
        if(identity.email !== email) {
            throw new Error('Invalid credentials');
        }

        const passwordValid = await this.passwordService.verifyPassword(password, passwordHash);
        if(!passwordValid) {
            throw new Error('Invalid credentials');
        }

        if(!canIdentityAuthenticate(identity)) {
            throw new Error('Identity cannot authenticate');
        }

        if(!canAccountAuthenticate(account)) {
            throw new Error('Account cannot authenticate');
        }

        const tokenFamily = this.tokenService.generateTokenFamily();
        const accessToken = await this.tokenService.generateAccessToken({
            identityId: identity.id,
            accountId: account.id,
            scope: account.scopeCode,
            tenantId: account.tenantId
        });

        const refreshToken = await this.tokenService.generateRefreshToken(
            {
                identityId: identity.id,
                accountId: account.id,
                scope: account.scopeCode,
                tenantId: account.tenantId
            },
            tokenFamily
        );

        const sessionId = generateULID();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        return {
            accessToken,
            refreshToken,
            tokenFamily,
            session: {
                id: sessionId,
                identityId: identity.id,
                accountId: account.id,
                scope: account.scopeCode,
                tenantId: account.tenantId,
                expiresAt,
            },
        };
    }

    /**
     * Rotates refresh token and generates new token pair.
     *
     * @param refreshToken - Current refresh token
     * @param currentTokenFamily - Current token family
     * @returns New authentication result
     *
     * @throws Error if rotation fails
     *
     * @remarks
     * - Validates current refresh token
     * - Generates new token family for security
     * - Implements deny-by-default rotation
     */
    async rotateRefreshToken(
        refreshToken: string,
        currentTokenFamily: ULID,
    ): Promise<AuthenticationResult>{
        const tokenPayload= await this.tokenService.validateRefreshToken(refreshToken);

        if(tokenPayload.tokenFamily !== currentTokenFamily) {
            throw new Error('Invalid token family');
        }

        const newTokenFamily = this.tokenService.generateTokenFamily();

        const accessToken = await this.tokenService.generateAccessToken({
            identityId: tokenPayload.identityId,
            accountId: tokenPayload.accountId,
            scope: tokenPayload.scope,
            tenantId: tokenPayload.tenantId,
        });

        const newRefreshToken = await this.tokenService.generateRefreshToken(
            {
                identityId: tokenPayload.identityId,
                accountId: tokenPayload.accountId,
                scope: tokenPayload.scope,
                tenantId: tokenPayload.tenantId,
            },
            newTokenFamily
        );

        const SessionId = generateULID();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        return {
            accessToken,
            refreshToken: newRefreshToken,
            tokenFamily: newTokenFamily,
            session: {
                id: SessionId,
                identityId: tokenPayload.identityId,
                accountId: tokenPayload.accountId,
                scope: tokenPayload.scope,
                tenantId: tokenPayload.tenantId,
                expiresAt,
            },
        };
    }

    /**
     * Validates access token and extracts payload.
     *
     * @param accessToken - JWT access token
     * @returns Token payload if valid
     *
     * @throws Error if token is invalid
     *
     * @remarks
     * - Stateless verification
     * - Fast database-free validation
     * - Used for API request authentication
     */
    async validateAccessToken(accessToken: string): Promise<{
        identityId: string,
        accountId: string,
        scope: Scope,
        tenantId?: string,
    }> {
        return await this.tokenService.validateAccessToken(accessToken);
    }
}
