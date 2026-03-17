# Task: DB-20 — Extend Product model for state and slug
Blueprints: Domain G (Product Catalog Core), Domain H (Catalog Visibility & Publication)
Phase: 02 Catalog

## Layer

database

## Package / Area

packages/db/prisma

## Purpose

Extend the Product model to include status, slug, and publication metadata in
line with catalog blueprints and string-based status codes (no enums).

## Implementation Location

packages/db/prisma/schema.prisma

## Implementation Notes

* Add fields to the `Product` model:
  * `status` as a string column representing product state (e.g. `"draft"`,
    `"published"`, `"inactive"`). Do **not** use a database enum type.
  * `slug` as a string column for product slug values
  * `publishedAt` (or similar) as a nullable timestamp for publication time
* Consider adding a lookup table for statuses:
  * `product_status (code TEXT PRIMARY KEY, ...metadata...)`
  * Optional foreign key from `product.status` to `product_status.code`
  * This supports governance without forcing DB enums
* Add indexes that support common queries:
  * e.g. `(tenantId, status)` for filtering by publication state
  * e.g. `(tenantId, slug)` for slug-based lookups

## Acceptance Criteria

* Product model in `schema.prisma` defines string-based `status` and `slug`
  fields, and a publication timestamp
* Any status lookup table and foreign keys are modeled if chosen
* Prisma validate passes and schema is ready for migration

## Dependencies

* DB-02 — Define core catalog and inventory models

## Estimated Effort

45–60 minutes

