import type { Scope } from '@spareparts/contracts';

/**
 * Validates scope consistency for IAM operations.
 *
 * @param actorScope - Scope of the acting principal
 * @param targetScope - Scope of the target operation
 * @param actorTenantId - Tenant ID of the actor (if applicable)
 * @param targetTenantId - Tenant ID of the target (if applicable)
 * @returns true if scope operation is allowed
 *
 * @remarks
 * - Platform actors can access any scope
 * - Tenant actors can only access their own tenant scope
 * - Customer actors can only access their own customer scope
 * - Cross-tenant operations are forbidden
 */
export function validateScopeOperation(
  actorScope: Scope,
  targetScope: Scope,
  actorTenantId?: string,
  targetTenantId?: string
): boolean {
  // Platform actors can access any scope
  if (actorScope === 'platform') {
    return true;
  }

  // Non-platform actors cannot access platform scope
  if (targetScope === 'platform') {
    return false;
  }

  // Scope must match exactly
  if (actorScope !== targetScope) {
    return false;
  }

  // For tenant and customer scopes, tenant ID must match
  if (actorTenantId !== targetTenantId) {
        return false;
  }

  return true;
}

/**
 * Determines if a scope requires tenant context.
 *
 * @param scopeCode - Scope code to check
 * @returns true if scope requires tenant ID
 *
 * @remarks
 * - Platform scope: no tenant context required
 * - Tenant scope: tenant context required
 * - Customer scope: tenant context required
 */
export function scopeRequiresTenantContext(scopeCode: Scope): boolean {
  return scopeCode !== 'platform';
}
