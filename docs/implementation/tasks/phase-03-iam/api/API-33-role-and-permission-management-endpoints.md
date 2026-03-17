# Task: API-33 — Role and permission management endpoints (governed)
Blueprint: Domain F (Authorization, Roles, and Active Scope)
Phase: 03 IAM

## Layer

api

## Package / Area

apps/api/src/http/controllers

## Purpose

Implement governed endpoints for managing roles, permissions, and assignments
within a scope (platform or tenant), recording append-only audit history for all
grants, revocations, assignments, and removals.

## Implementation Location

apps/api/src/http/controllers/iam/

## Implementation Notes

* Endpoints (examples, refine as needed):
  * `POST /iam/roles/:roleCode/permissions:grant`
  * `POST /iam/roles/:roleCode/permissions:revoke`
  * `POST /iam/accounts/:accountId/roles:assign`
  * `POST /iam/accounts/:accountId/roles:remove`
  * `GET /iam/roles`, `GET /iam/permissions`
* Scope rules:
  * Enforce scope-first evaluation; no cross-scope assignment
  * Tenant role assignment must not cross tenants
* Validation:
  * Use CONTRACTS-32 request contracts
* Audit/history:
  * Persist changes to `AccountRoleHistory` and `RolePermissionHistory` (PRISMA-32)
  * Record actor id, scope, tenant id (if applicable), reason metadata

## Acceptance Criteria

* Role/permission management endpoints exist and validate via contracts
* Scope and tenant boundaries are enforced
* All changes produce append-only audit history entries
* Unauthorized attempts are denied and do not leak sensitive info

## Dependencies

* API-32 — Authorization middleware and guards
* CONTRACTS-32 — Authorization and RBAC contracts
* PRISMA-31 — RBAC lookup models
* PRISMA-32 — IAM lookup and audit/history models

## Estimated Effort

150–240 minutes

