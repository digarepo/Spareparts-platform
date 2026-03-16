# Task: RLS-31 — IAM tenant isolation policies
Blueprints: Domain B (Data & Environment Enforcement), Domain C (Identity & Scope)
Phase: 03 IAM

## Layer

rls

## Package / Area

packages/db/rls

## Purpose

Implement strict tenant isolation policies for IAM tenant-scoped data so no tenant
can access or infer another tenant’s identities, accounts, roles, or audit trails.

## Implementation Location

PostgreSQL schema (migrations or SQL files under `packages/db/rls`)

## Implementation Notes

* Policies must enforce:
  * tenant-scoped access to tenant accounts and role assignments
  * deny-by-default when tenant context is missing
* Use the established mechanism for tenant context in Postgres session variables
  (Phase 01 API/DB foundations).
* Platform scope:
  * Platform supervisory access must be explicit and cannot act operationally
    on behalf of tenants by default.

## Acceptance Criteria

* Tenant-scoped IAM queries cannot read or mutate cross-tenant rows
* Missing tenant context yields denial at DB layer (no silent access)
* Policies are compatible with application session-variable approach for RLS

## Dependencies

* RLS-30 — Enable RLS on IAM tables
* API tenant context pipeline (Phase 01) sets DB tenant context

## Estimated Effort

60–120 minutes

