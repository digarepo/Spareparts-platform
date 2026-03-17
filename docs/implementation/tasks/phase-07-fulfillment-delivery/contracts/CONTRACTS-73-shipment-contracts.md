# Task: CONTRACTS-73 — Shipment contracts (transport execution)
Blueprint: Domain AJ (Shipment Logistics Model)
Phase: 07 Fulfillment & Delivery

## Layer

contracts

## Package / Area

packages/contracts/src/fulfillment-delivery

## Purpose

Define contracts for shipment creation and shipment state transitions, strictly separated from fulfillment preparation.

## Implementation Location

* packages/contracts/src/fulfillment-delivery/shipment.schema.ts
* packages/contracts/src/fulfillment-delivery/shipment-commands.schema.ts

## Implementation Notes

* Shipment must reference an existing fulfillment.
* Shipment is tenant-scoped and must never cross tenant boundaries.
* Carrier/tracking identifiers are explicit fields.
* State transitions are explicit and auditable.

## Acceptance Criteria

* Shipment create/query schemas exist.
* Shipment state transition command schemas exist.

## Dependencies

* CONTRACTS-71

## Estimated Effort

60–120 minutes
