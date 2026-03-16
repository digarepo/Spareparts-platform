# Task: DB-26 — Add taxonomy assignment history
Blueprint: Domain I (Taxonomy, Classification & Navigation)
Phase: 02 Catalog

## Layer

database

## Package / Area

packages/db/prisma

## Purpose

Record an auditable, reconstructable history of product classification changes
(product ↔ taxonomy/category assignments) without allowing taxonomy to influence
product semantics.

## Implementation Location

packages/db/prisma/schema.prisma

## Implementation Notes

* Add an append-only history model/table (naming suggestion):
  * `ProductTaxonomyAssignmentHistory`
    * `id`
    * `tenantId`
    * `productId`
    * `taxonomyId`
    * `action` (string: `assigned` / `unassigned`)
    * `occurredAt`
    * `actorId`
    * optional reason fields
* Indexes:
  * `(tenantId, productId, occurredAt)`
  * `(tenantId, taxonomyId, occurredAt)` if needed for category audit queries
* Ensure:
  * Assignments are explicit and auditable (Domain I)
  * History cannot be silently rewritten

## Acceptance Criteria

* Taxonomy assignment history table/model exists and is tenant-scoped
* Append-only semantics are preserved by design (no destructive updates)
* Indexes support common audit queries
* Prisma validate passes and schema is ready for migration

## Dependencies

* DB-22 — Add taxonomy models and relations

## Estimated Effort

60–90 minutes

