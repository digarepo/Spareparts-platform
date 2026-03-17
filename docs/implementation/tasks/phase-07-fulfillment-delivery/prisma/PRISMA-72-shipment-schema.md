# Task: PRISMA-72 — Shipment schema (references fulfillment, tenant-scoped)
Blueprint: Domain AJ (Shipment Logistics Model)
Phase: 07 Fulfillment & Delivery

## Layer

database

## Package / Area

packages/db/prisma

## Purpose

Persist shipment records as transport execution that references fulfillment, remains tenant-scoped, and has stable identity.

## Implementation Location

* packages/db/prisma/schema.prisma

## Implementation Notes

* Add `Shipment` model:
  * id (ULID)
  * tenant_id (ULID)
  * fulfillment_id (FK)
  * carrier (string)
  * tracking_number (string, nullable until assigned)
  * shipping_service (string, nullable)
  * status (enum)
  * created_at/updated_at
* Constraints:
  * shipment must reference an existing fulfillment
  * tenant_id must match fulfillment tenant (enforce via application constraint; DB constraint if feasible)

## Acceptance Criteria

* Shipment model exists and validates.
* Tenant-scoped query indexes exist.

## Dependencies

* PRISMA-70

## Estimated Effort

60–120 minutes
