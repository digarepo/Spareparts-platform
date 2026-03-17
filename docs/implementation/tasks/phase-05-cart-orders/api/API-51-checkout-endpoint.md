# Task: API-51 — Implement checkout endpoint (explicit cart-to-order trigger)
Blueprint: Domain P (Order Transitions, Governance & Failure Semantics)
Phase: 05 Cart & Orders

## Layer

api

## Package / Area

apps/api/src

## Purpose

Expose the explicit cart-to-order transition endpoint so customer intent becomes commitment exactly once per explicit trigger, with idempotency and explicit failure semantics.

## Implementation Location

* apps/api/src/modules/checkout/checkout.controller.ts
* apps/api/src/modules/checkout/checkout.service.ts

## Implementation Notes

* Validate request using checkout transition contracts.
* Enforce customer scope.
* Must be conceptually idempotent under retries:
  * use idempotency key
  * no duplicate orders
  * no ghost orders
* Must not be created due to payment success.

## Acceptance Criteria

* Checkout endpoint exists
* Request validated via contracts
* On success:
  * order created with stable identity
  * pricing snapshots captured
  * response contains order id
* On failure:
  * no partial order exists
  * failure is explicit

## Dependencies

* CONTRACTS-54 — Checkout transition contracts
* DOMAIN-52 — Cart-to-order transition
* PRISMA-50 — Define cart and order persistence schema

## Estimated Effort

60–120 minutes
