# Task: DOMAIN-74 — Implement tracking event append-only semantics
Blueprint: Domain AK (Delivery & Tracking Governance)
Phase: 07 Fulfillment & Delivery

## Layer

domain

## Package / Area

domains/logistics

## Purpose

Implement tracking as append-only observational events describing shipment movement.

## Implementation Location

* domains/logistics/src/tracking/tracking.service.ts

## Implementation Notes

* Tracking events do not grant authority.
* Tracking must not mutate shipment state automatically.
* Corrections are new events.

## Acceptance Criteria

* Tracking events are append-only.
* Attempts to modify past tracking are rejected.

## Dependencies

* DOMAIN-72
* PRISMA-74

## Estimated Effort

60–120 minutes
