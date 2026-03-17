# Task: DB-04 — Add catalog indexes and constraints
Blueprint: Domain G (Product Catalog Core)
Phase: 01 Foundations

## Layer

database

## Package / Area

packages/db/prisma

## Purpose

Add indexes and constraints that enforce catalog uniqueness and improve query
performance while preserving tenant isolation.

## Implementation Location

packages/db/prisma/schema.prisma

## Implementation Notes

* Add unique and composite indexes aligned with catalog rules, for example:
  * Unique product slug per tenant
  * Composite indexes on `(tenantId, productId)` or similar where needed
* Ensure indexes:
  * Do not introduce cross-tenant uniqueness
  * Support common catalog queries (by tenant, slug, product/variant)
* Keep this task focused on indexes and constraints, not new models.

## Acceptance Criteria

* Prisma schema defines necessary unique and composite indexes for catalog models
* Index definitions compile successfully
* Indexes respect tenant-isolated semantics (no global uniqueness by accident)

## Dependencies

* DB-02 — Define core catalog and inventory models
* DB-03 — Add tenant scoping and core relations

## Estimated Effort

30–45 minutes

