# Task: DOMAIN-31 — Authentication services and token issuance
Blueprints: Domain E (Authentication & Trust), Domain C (Identity & Scope)
Phase: 03 IAM

## Layer

domain

## Package / Area

domains/iam

## Purpose

Implement domain services for authentication that verify credentials, establish
identity, and issue sessions/tokens without making authorization decisions.

## Implementation Location

domains/iam/

## Implementation Notes

* Implement:
  * Password hashing + verification utility (argon2 preferred for production)
  * Token generator and validator (JWT access token + refresh token strategy)
  * Refresh token rotation logic (deny-by-default; revoke on suspicious reuse)
* Ensure:
  * Authentication establishes identity only (no role/permission checks)
  * Scope selection/validation happens explicitly after authentication
  * Identity lifecycle states (suspended/deactivated/terminated) block auth
* Keep domain pure:
  * No HTTP, ORM, or DB calls directly in domain functions
  * Use interfaces (ports) for persistence where needed

## Acceptance Criteria

* Credential verification and token issuance logic exists in `domains/iam/`
* Refresh token rotation is implemented with clear revoke behavior
* Identity lifecycle state blocks authentication consistently
* Unit tests cover:
  * password hash/verify
  * token issue/validate
  * refresh rotation and reuse handling

## Dependencies

* DOMAIN-30 — IAM domain module and models
* PRISMA-30 — IAM core models (for persistence mapping by infrastructure layer)

## Estimated Effort

120–180 minutes

