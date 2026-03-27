/**
 * Authorization contracts.
 *
 * @remarks
 *  - **Scope:** platform
 *  - **Authority:** contracts only; no persistence semantics
 *  - **Invariants:** role-based permissions, scope-aware access control
 */
export * from './authorization.entities';
export * from './authorization.request';
