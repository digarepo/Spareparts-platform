# Task: PRISMA-52 — Define order event/audit persistence schema
Blueprint: Domain P (Order Transitions, Governance & Failure Semantics)
Phase: 05 Cart & Orders

## Layer

prisma

## Package / Area

packages/db (Prisma schema)

## Purpose

Persist an append-only, reconstructable order event/audit log capturing:
- order creation (cart-to-order transition)
- lifecycle transitions
- explicit failures
- explicit cancellations

## Implementation Location

* packages/db/prisma/schema.prisma
* packages/db/prisma/migrations/*

## Implementation Notes

* Create an order event table that stores:
  * event_id (ULID)
  * order_id (ULID)
  * event_type (finite enum/string)
  * occurred_at
  * actor attribution fields where available
  * reason classification
* Events must be append-only.

## Acceptance Criteria

* Prisma schema includes an OrderEvent model/table
* Table is tenant-safe (no cross-tenant leakage via joins)
* Migration can be generated/applied without errors

## Dependencies

* PRISMA-50 — Define cart and order persistence schema
* CONTRACTS-55 — Order event and audit contracts

## Estimated Effort

45–90 minutes
