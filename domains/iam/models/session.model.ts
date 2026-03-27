import type { SessionId, IdentityId, AccountId, Scope } from '@spareparts/contracts';

/**
 * Pure domain model for Session.
 *
 * @remarks
 * - Represents active authentication context
 * - Links identity, account, scope, and tenant
 * - Has explicit expiration for security
 * - Can be revoked administratively
 */
export interface SessionModel {
  readonly id: SessionId;
  readonly identityId: IdentityId;
  readonly accountId: AccountId;
  readonly scopeCode: Scope;
  readonly tenantId?: string;
  readonly createdAt: Date;
  readonly expiresAt: Date;
  readonly revokedAt?: Date;
  readonly revokedReasonCode?: string;
}

/**
 * Checks if session is currently valid.
 *
 * @param session - Session to validate
 * @param now - Current timestamp (defaults to Date.now())
 * @returns true if session is active and not expired
 *
 * @remarks
 * - Session must not be revoked
 * - Session must not be expired
 * - Uses explicit expiration for security
 */
export function isSessionValid(session: SessionModel, now: Date = new Date()): boolean {
  // Session must not be revoked
  if (session.revokedAt) {
    return false;
  }

  // Session must not be expired
  return now <= session.expiresAt;
}

/**
 * Checks if session is within specified scope.
 *
 * @param session - Session to validate
 * @param scopeCode - Expected scope code
 * @param tenantId - Expected tenant ID (for tenant scope)
 * @returns true if session matches scope requirements
 *
 * @remarks
 * - Validates scope consistency with account model
 * - Used for authorization scope validation
 */
export function isSessionInScope(
  session: SessionModel,
  scopeCode: Scope,
  tenantId?: string
): boolean {
  if (session.scopeCode !== scopeCode) {
    return false;
  }

  // Platform scope forbids tenantId
  if (scopeCode === 'platform') {
    return session.tenantId === undefined;
  }

  // Tenant and customer scope require matching tenantId
  return session.tenantId === tenantId;
}
