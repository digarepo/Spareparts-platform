# Task: PRISMA-31 — IAM RBAC lookup models (Roles, Permissions, Assignments)
Blueprint: Domain F (Authorization, Roles, and Active Scope)
Phase: 03 IAM

## Layer

prisma

## Package / Area

packages/db/prisma/schema.prisma

## Purpose

Define production-grade RBAC data models using lookup tables and string-based codes
to support scoped roles, explicit permissions, and governed assignment.

## Implementation Location

packages/db/prisma/schema.prisma

## Implementation Notes

* Lookup tables (string codes, no enums):
  * `Role`:
    * `code` (string primary key)
    * `scopeCode` (FK to `Scope.code`)
    * name/label/description
  * `Permission`:
    * `code` (string primary key)
    * `scopeCode`
    * `action` and `resource` columns (strings) to keep permissions explicit
* Join tables:
  * `RolePermission` (many-to-many) — which permissions a role grants
  * `AccountRole` (many-to-many) — which roles an account has
* Constraints:
  * Prevent cross-scope role assignment (account scope must match role scope)
  * Prevent cross-scope permission grants (role scope must match permission scope)

## Acceptance Criteria

* Role and Permission lookup models exist (string codes as keys)
* RolePermission and AccountRole join models exist with appropriate constraints/indexes
* Prisma validate passes

## Dependencies

* PRISMA-30 — IAM core models (Identity, Account, Session)

## Estimated Effort

90–150 minutes

