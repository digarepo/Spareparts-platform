# Task: PRISMA-70 — Fulfillment + fulfillment items schema (tenant-scoped)
Blueprint: Domain AI (Fulfillment Core Model & Ownership)
Phase: 07 Fulfillment & Delivery

## Layer

database

## Package / Area

packages/db/prisma

## Purpose

Persist fulfillment records as tenant-owned operational execution objects that reference orders and order lines, without embedding payment meaning.

## Implementation Location

* packages/db/prisma/schema.prisma

## Implementation Notes

* Add `Fulfillment` model:
  * id (ULID string)
  * tenant_id (ULID string)
  * order_id (ULID string)
  * status (enum)
  * created_at/updated_at
* Add `FulfillmentItem` model:
  * id (ULID string)
  * fulfillment_id (FK)
  * order_line_id (ULID string)
  * quantity (int)
  * created_at
* Constraints:
  * enforce tenant_id scope
  * quantity must be positive
  * do not allow fulfilled quantity > ordered quantity (domain/service enforcement + optional DB check if feasible)

## Acceptance Criteria

* Models exist and validate.
* Indexes support tenant + order queries.

## Dependencies

* Phase 05 order schema (order + order lines)

## Estimated Effort

60–120 minutes
