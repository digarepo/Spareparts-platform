# Task: PRISMA-71 — Fulfillment state + history schema (auditable transitions)
Blueprint: Domain AI (Fulfillment Core Model & Ownership)
Phase: 07 Fulfillment & Delivery

## Layer

database

## Package / Area

packages/db/prisma

## Purpose

Persist fulfillment state transitions in a way that supports auditability and reconstructable history.

## Implementation Location

* packages/db/prisma/schema.prisma

## Implementation Notes

* Prefer append-only history:
  * `FulfillmentEvent` or `FulfillmentStatusHistory`
  * event_id (ULID)
  * fulfillment_id
  * from_status/to_status
  * occurred_at
  * actor attribution (optional)
* Ensure the current status is also stored on `Fulfillment` for query efficiency.

## Acceptance Criteria

* Status enum exists.
* Transition history model exists.

## Dependencies

* PRISMA-70

## Estimated Effort

60–120 minutes
