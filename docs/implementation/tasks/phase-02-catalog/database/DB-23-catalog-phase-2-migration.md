# Task: DB-23 — Generate and apply catalog Phase 2 migration
Blueprint: Domain B (Data & Environment Enforcement)
Phase: 02 Catalog

## Layer

database

## Package / Area

packages/db/prisma

## Purpose

Generate and apply the database migration(s) that introduce Product state/slug,
Variant SKU/attributes, and taxonomy models for Phase 2 of the catalog.

## Implementation Location

packages/db/prisma

## Implementation Notes

* Use Prisma CLI to:
  * Generate migration(s) capturing changes from DB-20, DB-21, and DB-22
  * Apply migrations to the local development database
* Verify:
  * New columns and tables exist (status, slug, publishedAt, sku, attributes,
    taxonomy, classification)
  * Indexes and constraints behave as expected

## Acceptance Criteria

* New migration directory (or directories) exist under
  `packages/db/prisma/migrations/`
* Migrations apply cleanly to the local database
* Schema in the database matches `schema.prisma`

## Dependencies

* DB-20 — Extend Product model for state and slug
* DB-21 — Extend Variant model for SKU and attributes
* DB-22 — Add taxonomy models and relations

## Estimated Effort

30–45 minutes

