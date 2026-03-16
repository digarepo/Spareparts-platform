# Task: DOMAIN-72 — Implement Shipment aggregate and boundaries
Blueprint: Domain AJ (Shipment Logistics Model)
Phase: 07 Fulfillment & Delivery

## Layer

domain

## Package / Area

domains/logistics

## Purpose

Implement shipment as transport execution, strictly separated from fulfillment preparation.

## Implementation Location

* domains/logistics/src/shipment/shipment.aggregate.ts
* domains/logistics/src/shipment/shipment-status.ts

## Implementation Notes

* Shipment must reference an existing fulfillment.
* Shipment is tenant-scoped and must not cross tenant boundaries.
* Shipment must not exceed fulfilled quantities.
* Carrier/tracking fields are explicit.

## Acceptance Criteria

* Shipment aggregate exists.
* Invariants enforced for references and tenant scope.

## Dependencies

* DOMAIN-70
* PRISMA-72

## Estimated Effort

120–240 minutes
