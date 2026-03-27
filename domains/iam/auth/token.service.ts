import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { generateULID, type ULID, type Scope } from '@spareparts/contracts';

/**
 * Custom Payload interface to ensure type safety across the service
 */
interface SparepartsJWTPayload extends JWTPayload {
  sub: string;
  account_id: string;
  scope: Scope;
  tenant_id?: string;
  type: 'access' | 'refresh';
  family?: ULID;
}

/**
 * JWT token generation and validation service.
 *
 * @remarks
 * - Uses jose library for modern JWT handling
 * - Separate access and refresh token strategies
 * - Supports token rotation and revocation
 */
export class TokenService {
  private readonly accessSecret: Uint8Array;
  private readonly refreshSecret: Uint8Array;
  private readonly issuer: string;

  constructor() {
    const accessSecret = process.env['JWT_ACCESS_SECRET'];
    const refreshSecret = process.env['JWT_REFRESH_SECRET'];

    if (!accessSecret || !refreshSecret) {
      throw new Error('JWT Secrets are not defined in environment variables');
    }

    this.accessSecret = new TextEncoder().encode(accessSecret);
    this.refreshSecret = new TextEncoder().encode(refreshSecret);
    this.issuer = process.env['JWT_ISSUER'] ?? 'spareparts-platform';
  }

  /**
   * Generates an access token with short TTL.
   *
   * @param payload - Token payload data
   * @param expiresIn - Expiration time (default 15 minutes)
   * @returns Signed JWT access token
   *
   * @remarks
   * - Short-lived for security
   * - Stateless verification
   * - Contains minimal data
   */
  async generateAccessToken(
    payload: {
      identityId: string;
      accountId: string;
      scope: Scope;
      tenantId?: string;
    },
    expiresIn: string = '15m'
  ): Promise<string> {
    const now = Math.floor(Date.now() / 1000);

    return await new SignJWT({
      sub: payload.identityId,
      account_id: payload.accountId,
      scope: payload.scope,
      tenant_id: payload.tenantId,
      type: 'access',
    } satisfies SparepartsJWTPayload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuer(this.issuer)
      .setAudience('spareparts-api')
      .setIssuedAt(now)
      .setExpirationTime(now + this.parseDuration(expiresIn))
      .sign(this.accessSecret);
  }

  /**
   * Generates a refresh token with longer TTL.
   *
   * @param payload - Token payload data
   * @param tokenFamily - Family identifier for rotation
   * @param expiresIn - Expiration time (default 7 days)
   * @returns Signed JWT refresh token
   *
   * @remarks
   * - Longer-lived for session persistence
   * - Includes family for rotation tracking
   * - Used to obtain new access tokens
   */
  async generateRefreshToken(
    payload: {
      identityId: string;
      accountId: string;
      scope: Scope;
      tenantId?: string;
    },
    tokenFamily: ULID,
    expiresIn: string = '7d'
  ): Promise<string> {
    const now = Math.floor(Date.now() / 1000);

    return await new SignJWT({
      sub: payload.identityId,
      account_id: payload.accountId,
      scope: payload.scope,
      tenant_id: payload.tenantId,
      family: tokenFamily,
      type: 'refresh',
    } satisfies SparepartsJWTPayload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuer(this.issuer)
      .setAudience('spareparts-api')
      .setIssuedAt(now)
      .setExpirationTime(now + this.parseDuration(expiresIn))
      .sign(this.refreshSecret);
  }

  /**
   * Validates an access token.
   *
   * @param token - JWT access token
   * @returns Token payload if valid
   *
   * @throws Error if token is invalid
   *
   * @remarks
   * - Stateless verification
   * - Fast database-free validation
   * - Returns structured payload
   */
  async validateAccessToken(token: string): Promise<{
    identityId: string;
    accountId: string;
    scope: Scope;
    tenantId?: string;
  }> {
    try {
      const { payload } = await jwtVerify(token, this.accessSecret, {
        issuer: this.issuer,
        audience: 'spareparts-api',
      });

      const p = payload as SparepartsJWTPayload;

      if (p.type !== 'access') {
        throw new Error('Invalid token type');
      }

      return {
        identityId: p.sub,
        accountId: p.account_id,
        scope: p.scope,
        tenantId: p.tenant_id,
      };
    } catch {
      throw new Error('Invalid access token');
    }
  }

  /**
   * Validates a refresh token.
   *
   * @param token - JWT refresh token
   * @returns Token payload with family if valid
   *
   * @throws Error if token is invalid
   *
   * @remarks
   * - Includes family for rotation logic
   * - Used to generate new token pairs
   */
  async validateRefreshToken(token: string): Promise<{
    identityId: string;
    accountId: string;
    scope: Scope;
    tenantId?: string;
    tokenFamily: ULID;
  }> {
    try {
      const { payload } = await jwtVerify(token, this.refreshSecret, {
        issuer: this.issuer,
        audience: 'spareparts-api',
      });

      const p = payload as SparepartsJWTPayload;

      if (p.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      if (!p.family) {
        throw new Error('Refresh token missing family identifier');
      }

      return {
        identityId: p.sub,
        accountId: p.account_id,
        scope: p.scope,
        tenantId: p.tenant_id,
        tokenFamily: p.family,
      };
    } catch {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Generates a new token family identifier.
   *
   * @returns ULID for token family tracking
   *
   * @remarks
   * - Used for refresh token rotation
   * - Enables mass revocation of related tokens
   */
  generateTokenFamily(): ULID {
    return generateULID();
  }

  /**
   * Refined Type-Safe Duration Parser
   */
  private parseDuration(duration: string): number {
    const units: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
      w: 604800,
    };

    const match = duration.match(/^(\d+)([smhdw])$/);
    if (!match) throw new Error('Invalid duration format');

    const amountStr = match[1];
    const unitStr = match[2];

    const amount = amountStr ? parseInt(amountStr, 10) : 0;
    const unitValue = unitStr ? units[unitStr] : undefined;

    if (unitValue === undefined) {
      throw new Error(`Unsupported duration unit: ${unitStr}`);
    }

    return amount * unitValue;
  }
}
