# Task: DB-007 — Create Inventory model
Blueprint: Domain K (Inventory Core Model)
Phase: 01 Foundations

## Layer

database

## Package / Area

packages/db/prisma

## Purpose

Define Inventory model in Prisma.

## Implementation Location

packages/db/prisma/schema.prisma

## Implementation Notes

* Include variant_id foreign key, quantity, unit
* UUID primary key
* tenant_id foreign key

## Acceptance Criteria

* Inventory model exists
* Quantity field enforced
* Foreign keys to Variant and Tenant defined

## Dependencies

DB-001
DB-002
DB-003
DB-005

## Estimated Effort

20 minutes
