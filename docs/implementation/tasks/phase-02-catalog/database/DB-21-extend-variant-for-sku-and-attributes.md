# Task: DB-21 — Extend Variant model for SKU and attributes
Blueprint: Domain G (Product Catalog Core)
Phase: 02 Catalog

## Layer

database

## Package / Area

packages/db/prisma

## Purpose

Extend the Variant model to include SKU and variant attributes in a way that
supports unique identification per tenant and flexible configuration.

## Implementation Location

packages/db/prisma/schema.prisma

## Implementation Notes

* Add fields to the `Variant` model:
  * `sku` as a string column representing the variant SKU
  * `attributes` as a JSON or structured column for variant-defining attributes
* Enforce SKU uniqueness:
  * Add an index or unique constraint for SKU scoped appropriately (e.g.
    `(tenantId, sku)` or `(productId, sku)` depending on design)
* Keep attributes:
  * Focused on variant-defining properties, aligned with Domain G
  * Flexible enough to evolve (JSON can be acceptable if governed)

## Acceptance Criteria

* Variant model in `schema.prisma` defines `sku` and `attributes` fields
* An appropriate index/constraint ensures SKU uniqueness within tenant or
  product scope
* Prisma validate passes and schema is ready for migration

## Dependencies

* DB-02 — Define core catalog and inventory models

## Estimated Effort

45–60 minutes

