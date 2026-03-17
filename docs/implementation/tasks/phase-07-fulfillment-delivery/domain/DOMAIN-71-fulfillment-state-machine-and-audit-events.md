# Task: DOMAIN-71 — Implement fulfillment state machine + audit events
Blueprint: Domain AI (Fulfillment Core Model & Ownership)
Phase: 07 Fulfillment & Delivery

## Layer

domain

## Package / Area

domains/fulfillment

## Purpose

Implement explicit, auditable fulfillment state transitions.

## Implementation Location

* domains/fulfillment/src/fulfillment/fulfillment.lifecycle.ts
* domains/fulfillment/src/events/fulfillment-events.ts

## Implementation Notes

* State transitions are intentional and must be validated.
* Emit append-only domain events for:
  * created
  * processing
  * packed
  * dispatched
  * completed
  * cancelled
* Do not infer business meaning (payment/order validity) from fulfillment transitions.

## Acceptance Criteria

* Illegal transitions are rejected.
* Transition emits event record suitable for persistence.

## Dependencies

* DOMAIN-70
* PRISMA-71

## Estimated Effort

90–180 minutes
