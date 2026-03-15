# Task: CONTRACTS-74 — Tracking + delivery confirmation contracts (append-only)
Blueprint: Domain AK (Delivery & Tracking Governance)
Phase: 07 Fulfillment & Delivery

## Layer

contracts

## Package / Area

packages/contracts/src/fulfillment-delivery

## Purpose

Define append-only tracking event contracts and immutable delivery confirmation contracts.

## Implementation Location

* packages/contracts/src/fulfillment-delivery/tracking.schema.ts
* packages/contracts/src/fulfillment-delivery/delivery-confirmation.schema.ts

## Implementation Notes

* Tracking events:
  * represent visibility only
  * must be append-only
  * corrections are new events
* Delivery confirmation:
  * references a shipment
  * includes timestamp
  * immutable

## Acceptance Criteria

* Tracking event schemas exist.
* Delivery confirmation schemas exist.

## Dependencies

* CONTRACTS-71

## Estimated Effort

60–120 minutes
