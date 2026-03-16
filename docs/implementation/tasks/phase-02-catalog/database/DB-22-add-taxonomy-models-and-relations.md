# Task: DB-22 — Add taxonomy models and relations
Blueprint: Domain I (Taxonomy, Classification & Navigation)
Phase: 02 Catalog

## Layer

database

## Package / Area

packages/db/prisma

## Purpose

Add taxonomy-related models and relations so products can be classified into
categories while preserving tenant isolation and taxonomy semantics.

## Implementation Location

packages/db/prisma/schema.prisma

## Implementation Notes

* Add a `Taxonomy` (or `Category`) model to represent taxonomy nodes:
  * String-based identifier (aligned with TaxonomyId contracts)
  * Parent relationship for hierarchy (self-referencing relation)
  * Fields for labels and ordering
* Add a join model/table for product classification:
  * e.g. `ProductTaxonomy` linking Product ↔ Taxonomy
  * Enforce tenant-scoped classification (no cross-tenant assignments)
* Add indexes to support:
  * Hierarchy traversal (e.g. by parent)
  * Product lookup by taxonomy/category

## Acceptance Criteria

* Taxonomy and classification models are defined in `schema.prisma`
* Relations between Product and Taxonomy exist via a join model/table
* Indexes support common taxonomy and classification queries
* Prisma validate passes

## Dependencies

* DB-02 — Define core catalog and inventory models

## Estimated Effort

60–90 minutes

