# Task: CONTRACTS-32 — Authorization and RBAC contracts (roles/permissions/assignments)
Blueprints: Domain C (Identity & Scope), Domain F (Authorization, Roles, Scope)
Phase: 03 IAM

## Layer

contracts

## Package / Area

packages/contracts

## Purpose

Define contracts for roles, permissions, and governed assignment/revocation actions,
ensuring authorization remains scope-first, deny-by-default, and auditable.

## Implementation Location

* packages/contracts/src/iam/authorization/rbac.schema.ts
* packages/contracts/src/iam/authorization/rbac-requests.schema.ts

## Implementation Notes

* Use string-based codes (no TypeScript enums, no DB enums):
  * `RoleCode`, `PermissionCode`, `ScopeCode` as string unions where appropriate
* RBAC shape contracts:
  * Role (code, name/label, scope, description)
  * Permission (code, action, resource, scope)
* Governed mutation contracts:
  * Grant/revoke permission to role
  * Assign/remove role to/from account
  * Each mutation request must include:
    * actor identity (or is derived from auth context)
    * explicit scope
    * target account/user id
    * reason metadata (optional but encouraged)
* Documentation:
  * JSDoc describing scope-first evaluation and non-goals

## Acceptance Criteria

* RBAC contracts modules exist and export schemas and types
* Contracts represent roles and permissions as string-based codes
* Assignment/revocation requests require explicit scope and target identifiers
* JSDoc is consistent and production-grade

## Dependencies

* CONTRACTS-30 — Establish IAM contracts structure

## Estimated Effort

60–90 minutes

