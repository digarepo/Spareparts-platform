# Task: PRISMA-32 — IAM lookup tables and audit/history models
Blueprints: Domain C (Identity & Scope), Domain D (Identity Lifecycle), Domain F (Authorization Auditability)
Phase: 03 IAM

## Layer

prisma

## Package / Area

packages/db/prisma/schema.prisma

## Purpose

Add lookup tables for lifecycle/status/scope codes and append-only audit/history
tables for identity state changes, role assignments, permission grants, and auth events.

## Implementation Location

packages/db/prisma/schema.prisma

## Implementation Notes

* Lookup tables (string-based codes + FK governance):
  * `Scope` (`code` PK: `platform`, `tenant`, `customer`)
  * `IdentityStatus` (`code` PK: `active`, `suspended`, `deactivated`, `terminated`)
  * `AccountStatus` (`code` PK: `active`, `suspended`, `closed`, etc.)
  * Optional: `AuthEventType`, `RoleAssignmentAction`, `PermissionGrantAction` lookup tables
* Append-only audit/history tables (naming suggestions):
  * `IdentityStatusHistory`:
    * identityId, fromStatusCode, toStatusCode, changedAt, actorId, reason fields
  * `AccountRoleHistory`:
    * accountId, roleCode, action (assigned/removed), occurredAt, actorId, reason
  * `RolePermissionHistory`:
    * roleCode, permissionCode, action (granted/revoked), occurredAt, actorId, reason
  * `AuthEvent`:
    * identityId/accountId/scope/tenantId
    * eventTypeCode (login_success, login_failure, refresh, logout, etc.)
    * occurredAt, ip/userAgent (optional), correlation id
* Indexing:
  * Support forensic queries by identity/account and time window
  * Support tenant-scoped audit queries without cross-tenant scans

## Acceptance Criteria

* Lookup tables exist and core models reference them via foreign keys
* Audit/history tables exist and are append-only by design
* Indexes exist for common audit queries (by identity/account, by tenant, by time)
* Prisma validate passes

## Dependencies

* PRISMA-30 — IAM core models
* PRISMA-31 — IAM RBAC lookup models

## Estimated Effort

150–240 minutes

