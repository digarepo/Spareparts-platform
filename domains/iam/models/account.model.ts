import type { AccountId, IdentityId, AccountStatus, Scope } from "@spareparts/contracts";

/**
 * Pure domain model for Account.
 *
 * @remarks
 * - Represents scope-bound participation (where/how)
 * - Links identity to specific execution context
 * - Tenant-scoped accounts require tenantId
 * - Platform-scoped accounts forbid tenantId
 */
export interface AccountModel {
  readonly id: AccountId;
  readonly identityId: IdentityId;
  readonly scopeCode: Scope;
  readonly tenantId?: string;
  readonly accountStatusCode: AccountStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Validates if account is within specified scope.
 *
 * @param account - Account to validate
 * @param scopeCode - Expected scope code
 * @param tenantId - Expected tenant ID (for tenant scope)
 * @returns true if account matches scope requirements
 *
 * @remarks
 * - Platform scope: tenantId must be undefined
 * - Tenant scope: tenantId must match exactly
 * - Customer scope: tenantId must match exactly
 */
export function isAccountInScope(
  account: AccountModel,
  scopeCode: Scope,
  tenantId?: string
): boolean {
  if (account.scopeCode !== scopeCode) {
    return false;
  }

  if (scopeCode === 'platform') {
    return account.tenantId === undefined;
  }

  return account.tenantId === tenantId;
}

/**
 * Checks if account can participate in sessions.
 *
 * @param account - Account to validate
 * @returns true if account is active
 *
 * @remarks
 * - Only active accounts can establish sessions
 * - Suspended/closed accounts cannot authenticate
 */
export function canAccountAuthenticate(account: AccountModel): boolean {
    return account.accountStatusCode === 'active';
}
