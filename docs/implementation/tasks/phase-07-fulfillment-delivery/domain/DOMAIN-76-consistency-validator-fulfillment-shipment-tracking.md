# Task: DOMAIN-76 — Implement fulfillment/shipment/tracking consistency validator
Blueprint: Domain AI (Fulfillment Core Model & Ownership), Domain AJ (Shipment Logistics Model), Domain AK (Delivery & Tracking Governance)
Phase: 07 Fulfillment & Delivery

## Layer

domain

## Package / Area

domains/logistics

## Purpose

Provide a domain-level validator that checks structural consistency across fulfillment, shipment, tracking, and delivery confirmation.

## Implementation Location

* domains/logistics/src/validators/logistics-consistency.validator.ts

## Implementation Notes

* Validate that:
  * shipment references fulfillment
  * tenant scope matches
  * quantities shipped do not exceed fulfilled quantities
  * delivery confirmation references shipment
* Validator must not mutate state; it only detects invalid structures.

## Acceptance Criteria

* Validator exists and is used by application services before accepting transitions.

## Dependencies

* DOMAIN-70..75

## Estimated Effort

60–120 minutes
