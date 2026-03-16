# Task: PRISMA-53 — Generate/apply cart/order migrations and verify invariants
Blueprint: Domain AD (Data Integrity & Recovery), Domain O (Order Lines & Pricing Snapshots)
Phase: 05 Cart & Orders

## Layer

prisma

## Package / Area

packages/db

## Purpose

Create and apply the Prisma migrations for cart/order/pricing snapshot/event schema and verify DB-level invariants supporting historical correctness.

## Implementation Location

* packages/db/prisma/migrations/*

## Implementation Notes

* Generate migrations from Prisma schema changes.
* Apply migrations to a development database.
* Verify invariants:
  * order identity is stable
  * order line tenant_id is always present
  * pricing snapshots are not overwritten in-place

## Acceptance Criteria

* Migrations are generated and applied successfully
* Constraints exist and reject invalid writes
* A short verification log exists (test output or notes)

## Dependencies

* PRISMA-50 — Define cart and order persistence schema
* PRISMA-51 — Define order status and transition persistence
* PRISMA-52 — Define order event/audit persistence schema

## Estimated Effort

45–90 minutes
