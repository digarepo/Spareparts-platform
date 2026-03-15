# Task: PRISMA-43 — Generate/apply inventory migrations and verify constraints
Blueprint: Domain AD (Data Integrity & Recovery), Domain K (Inventory Core Model)
Phase: 04 Inventory

## Layer

prisma

## Package / Area

packages/db

## Purpose

Create and apply the Prisma migrations for inventory/reservations/events, and verify database-level constraints enforce invariants under concurrent usage.

## Implementation Location

* packages/db/prisma/migrations/*
* Any migration verification scripts/docs you already use

## Implementation Notes

* Generate migrations from the Prisma schema changes.
* Apply migrations to a development database.
* Verify invariants are enforced at the DB level:
  * no negative inventory
  * no oversubscription (reserved + allocated <= on_hand)
  * uniqueness of (tenant_id, variant_id)
* Verification may be manual SQL checks or automated tests, but must be recorded.

## Acceptance Criteria

* Migrations are generated and applied successfully
* Constraints exist in the DB and reject invalid writes
* A short verification log exists (test output or notes) proving constraint behavior

## Dependencies

* PRISMA-41 — Define inventory and reservation persistence schema
* PRISMA-42 — Define inventory audit / event persistence schema

## Estimated Effort

45–90 minutes
