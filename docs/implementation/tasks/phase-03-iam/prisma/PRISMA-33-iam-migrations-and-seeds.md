# Task: PRISMA-33 — IAM migrations and lookup seeding
Blueprint: Domain B (Data & Environment Enforcement)
Phase: 03 IAM

## Layer

prisma

## Package / Area

packages/db/prisma

## Purpose

Generate and apply Prisma migrations for IAM tables and ensure lookup tables are
seeded repeatably across environments (no manual DB edits).

## Implementation Location

packages/db/prisma

## Implementation Notes

* Generate migration(s) that include:
  * IAM core models (Identity/Account/Credentials/Session)
  * RBAC lookup models (Role/Permission + joins)
  * Lookup tables and audit/history tables
* Apply migrations locally and verify schema.
* Seed:
  * Seed `Scope` codes
  * Seed identity/account status codes
  * Seed baseline roles and permissions for platform and tenant scope (minimal MVP)
* Ensure seeding is:
  * Idempotent
  * Auditable (seed changes tracked in git)

## Acceptance Criteria

* Migration(s) exist under `packages/db/prisma/migrations/` and apply cleanly
* Lookup tables are populated via a repeatable seed mechanism
* Baseline roles/permissions exist for initial system bootstrapping

## Dependencies

* PRISMA-30 through PRISMA-32

## Estimated Effort

60–120 minutes

