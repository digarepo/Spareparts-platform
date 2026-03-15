# Task: PRISMA-74 — Tracking events + delivery confirmation schema (append-only)
Blueprint: Domain AK (Delivery & Tracking Governance)
Phase: 07 Fulfillment & Delivery

## Layer

database

## Package / Area

packages/db/prisma

## Purpose

Persist tracking events as append-only records and delivery confirmation as an immutable final record.

## Implementation Location

* packages/db/prisma/schema.prisma

## Implementation Notes

* Add `TrackingEvent` model:
  * id (ULID)
  * shipment_id (FK)
  * event_type (string or enum)
  * event_time (datetime)
  * location (string nullable)
  * description (string nullable)
  * recorded_at (datetime)
* Add `DeliveryConfirmation` model:
  * id (ULID)
  * shipment_id (FK)
  * delivered_at
  * recipient_name (string nullable)
  * proof_of_delivery (json/string nullable)
  * created_at
* Ensure tracking events are never updated/deleted by application flows.

## Acceptance Criteria

* TrackingEvent and DeliveryConfirmation models exist.
* Indexes support shipment tracking queries.

## Dependencies

* PRISMA-72

## Estimated Effort

60–120 minutes
