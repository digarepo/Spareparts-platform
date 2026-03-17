# Task: DB-05 — Generate and apply initial database migration
Blueprint: Domain B (Data & Environment Enforcement)
Phase: 01 Foundations

## Layer

database

## Package / Area

packages/db/prisma

## Purpose

Generate and apply the initial Prisma migration that creates the tenant, catalog,
and inventory tables in the local PostgreSQL database.

## Implementation Location

packages/db/prisma

## Implementation Notes

* Use Prisma CLI to:
  * Generate an initial migration from the current `schema.prisma`
  * Apply the migration against the local development database
* Verify that:
  * Tables for Tenant, Product, Variant, Price, and Inventory are created
  * Relations, indexes, and constraints from previous tasks are present
* Do not manually edit the generated migration SQL unless necessary for
  environment or compatibility reasons.

## Acceptance Criteria

* Initial migration directory exists in `packages/db/prisma/migrations/`
* Migration applies cleanly to the local database
* Resulting schema matches the Prisma model definitions

## Dependencies

* DB-01 through DB-04 completed

## Estimated Effort

30–45 minutes

