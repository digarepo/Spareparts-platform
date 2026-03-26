/**
 * IAM(Identity and Access Management) contracts
 *
 * @remarks
 * - **Scope:** platform
 * - **Authority:** contracts only; no persistence semantics
 * - **Invariants:** explicit identity/account separation, scope-first execution
 *
 * @example
 * ```ts
 * import { AuthRequest, AuthResponse } from '@spareparts/contracts/iam';
 * ```
 */
export * from './auth';
export * from './authorization';
export * from './shared';
