# Task: API-72 — Tracking + delivery confirmation endpoints (append-only + immutable)
Blueprint: Domain AK (Delivery & Tracking Governance)
Phase: 07 Fulfillment & Delivery

## Layer

api

## Package / Area

apps/api/src

## Purpose

Expose endpoints to:
- append tracking events (authorized operational actors)
- query tracking events (customer/tenant visibility)
- record delivery confirmation (authorized)

## Implementation Location

* apps/api/src/modules/logistics/tracking.controller.ts
* apps/api/src/modules/logistics/delivery.controller.ts

## Implementation Notes

* Append tracking:
  * POST /shipments/:id/tracking-events
  * append-only; never update past events
* Query tracking:
  * GET /shipments/:id/tracking
  * customer-visible only for their own orders
* Delivery confirmation:
  * POST /shipments/:id/delivery-confirmation
  * immutable once recorded

## Acceptance Criteria

* Append/query endpoints exist.
* Customer visibility is enforced.
* Delivery confirmation cannot be overwritten.

## Dependencies

* CONTRACTS-74 — Tracking + delivery confirmation contracts
* RLS-72
* DOMAIN-74/75

## Estimated Effort

60–120 minutes
