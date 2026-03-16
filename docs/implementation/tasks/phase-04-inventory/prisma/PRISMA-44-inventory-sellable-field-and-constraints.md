# Task: PRISMA-44 — Add explicit sellability field to inventory schema
Blueprint: Domain L (Inventory Availability & Reservation)
Phase: 04 Inventory

## Layer

prisma

## Package / Area

packages/db (Prisma schema)

## Purpose

Persist an explicit sellability decision for inventory records, separate from quantity concepts.

This supports the blueprint rule that sellability is not implicitly inferred from on-hand/available.

## Implementation Location

* packages/db/prisma/schema.prisma
* packages/db/prisma/migrations/*

## Implementation Notes

* Add a boolean field (e.g. `sellable`) to the inventory table/model.
* Default must be explicit and safe:
  * recommend default `false` until tenant explicitly enables sellability.
* Ensure updates to sellable are tenant-scoped and auditable via events.

## Acceptance Criteria

* Inventory model includes a `sellable` boolean field with a safe default
* Migration is generated/applied cleanly
* Field is visible to read models and can be updated by domain operations

## Dependencies

* PRISMA-41 — Define inventory and reservation persistence schema

## Estimated Effort

20–45 minutes
