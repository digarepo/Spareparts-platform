# Task: RLS-32 — Platform supervisory policies for IAM (explicit, read-only)
Blueprints: Domain B (Data & Environment Enforcement), Domain C (Identity & Scope)
Phase: 03 IAM

## Layer

rls

## Package / Area

packages/db/rls

## Purpose

Provide an explicit, controlled platform supervisory access path for IAM data to
support governance and audits without weakening tenant isolation or enabling
operational mutation of tenant IAM state.

## Implementation Location

PostgreSQL schema (migrations or SQL files under `packages/db/rls`)

## Implementation Notes

* Implement platform policies that:
  * Allow read-only cross-tenant access under an explicit platform role/session
  * Deny all mutation of tenant-owned IAM rows (no UPDATE/DELETE/INSERT)
* Ensure platform override is:
  * Not implicitly enabled
  * Auditable (requests using it should be logged and/or recorded)

## Acceptance Criteria

* Platform supervisory policy exists and is read-only by construction
* Tenant-scoped roles remain tenant-isolated and unaffected
* No “backdoor” write path exists for platform roles on tenant IAM data

## Dependencies

* RLS-31 — IAM tenant isolation policies

## Estimated Effort

60–90 minutes

