# Task: PRISMA-73 — Shipment state + history schema (auditable transitions)
Blueprint: Domain AJ (Shipment Logistics Model)
Phase: 07 Fulfillment & Delivery

## Layer

database

## Package / Area

packages/db/prisma

## Purpose

Persist shipment state transitions for auditability and reconstructable transport history.

## Implementation Location

* packages/db/prisma/schema.prisma

## Implementation Notes

* Add shipment status enum representing transport progress.
* Add `ShipmentStatusHistory` (append-only):
  * event_id (ULID)
  * shipment_id
  * from_status/to_status
  * occurred_at
  * actor attribution (optional)

## Acceptance Criteria

* Status enum exists.
* Append-only shipment history exists.

## Dependencies

* PRISMA-72

## Estimated Effort

60–120 minutes
