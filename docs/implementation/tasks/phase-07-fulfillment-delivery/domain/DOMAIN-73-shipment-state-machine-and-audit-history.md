# Task: DOMAIN-73 — Implement shipment state machine + audit history
Blueprint: Domain AJ (Shipment Logistics Model)
Phase: 07 Fulfillment & Delivery

## Layer

domain

## Package / Area

domains/logistics

## Purpose

Implement explicit, auditable shipment transport state transitions.

## Implementation Location

* domains/logistics/src/shipment/shipment.lifecycle.ts
* domains/logistics/src/events/shipment-events.ts

## Implementation Notes

* Transport state transitions must be explicit and validated.
* Maintain append-only status history.

## Acceptance Criteria

* Illegal transitions rejected.
* Transitions produce append-only event records.

## Dependencies

* DOMAIN-72
* PRISMA-73

## Estimated Effort

90–180 minutes
