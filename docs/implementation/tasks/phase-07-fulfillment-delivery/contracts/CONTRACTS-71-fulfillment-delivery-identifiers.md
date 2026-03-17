# Task: CONTRACTS-71 — Fulfillment/Shipment/Tracking identifiers (ULID)
Blueprint: Domain AI (Fulfillment Core Model & Ownership), Domain AJ (Shipment Logistics Model), Domain AK (Delivery & Tracking Governance)
Phase: 07 Fulfillment & Delivery

## Layer

contracts

## Package / Area

packages/contracts/src/fulfillment-delivery

## Purpose

Define ULID-based identifiers for fulfillment and delivery concepts.

## Implementation Location

* packages/contracts/src/fulfillment-delivery/fulfillment-delivery-identifiers.schema.ts

## Implementation Notes

* Define and export:
  * FulfillmentId
  * FulfillmentItemId
  * ShipmentId
  * TrackingEventId
  * DeliveryConfirmationId
* All must validate as ULID strings.

## Acceptance Criteria

* Identifier schemas exist with JSDoc and examples.

## Dependencies

* CONTRACTS-70

## Estimated Effort

45–90 minutes
