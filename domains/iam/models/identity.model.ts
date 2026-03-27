import type { IdentityId, IdentityStatus } from "@spareparts/contracts";

/**
 * Pure domain model for Identity.
 *
 * @remarks
 * - Represents a global principal (who)
 * - Scope-agnostic by design
 * - Never contains tenant-specific information
 * - Email must be globally unique where applicable
 */
export interface IdentityModel {
    readonly id: IdentityId;
    readonly email: string;
    readonly lifecycleStatusCode: IdentityStatus;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}

/**
 * Validates if an identity can participate in authentication.
 *
 * @param identity - Identity to validate
 * @returns true if identity is in active state
 *
 * @remarks
 * - Only active identities can authenticate
 * - Suspended/deactivated/terminated identities are blocked
 */
export function canIdentityAuthenticate(identity: IdentityModel): boolean {
    return identity.lifecycleStatusCode === 'active';
}

/**
 * Checks if identity lifecycle allows account creation.
 *
 * @param identity - Identity to validate
 * @returns true if identity can have accounts
 *
 * @remarks
 * - Active and suspended identities can have accounts
 * - Deactivated/terminated identities cannot create new accounts
 */
export function canIdentityCreateAccount(identity: IdentityModel): boolean {
    return['active', 'suspended'].includes(identity.lifecycleStatusCode);
}
