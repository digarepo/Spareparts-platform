# Task: DB-27 — Generate and apply catalog audit/history migration
Blueprint: Domain B (Data & Environment Enforcement)
Phase: 02 Catalog

## Layer

database

## Package / Area

packages/db/prisma

## Purpose

Generate and apply migration(s) for Phase 2 catalog governance tables, including
status lookup and append-only audit/history tables.

## Implementation Location

packages/db/prisma

## Implementation Notes

* Use Prisma CLI to:
  * Generate migration(s) capturing DB-24, DB-25, and DB-26 changes
  * Apply migrations to the local development database
* Verify:
  * Lookup table is populated (via seed) with baseline status codes
  * History tables exist and have expected indexes

## Acceptance Criteria

* Migration directory (or directories) exist under `packages/db/prisma/migrations/`
* Migrations apply cleanly
* Seed mechanism populates required lookup rows repeatably

## Dependencies

* DB-24 — Product status lookup and FK
* DB-25 — Product status and publication history
* DB-26 — Taxonomy assignment history

## Estimated Effort

45–60 minutes

