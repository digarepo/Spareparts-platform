# Task: CONTRACTS-54 — Implement checkout (cart-to-order) transition contracts
Blueprint: Domain P (Order Transitions, Governance & Failure Semantics)
Phase: 05 Cart & Orders

## Layer

contracts

## Package / Area

packages/contracts

## Purpose

Define explicit request/response contracts for the cart-to-order transition so commitment occurs exactly once per explicit trigger and failures are explicit and explainable.

## Implementation Location

packages/contracts/src/checkout/checkout.schema.ts

## Implementation Notes

* Export request/response contracts for:
  * checkout request (explicit trigger)
  * checkout response (success or explicit failure)
* Idempotency:
  * include an `idempotency_key` (ULID or string) to support conceptual idempotency under retries.
* Failure semantics:
  * response must represent explicit failure without creating partial orders.
  * do not imply payment success or inventory reservation.

## Acceptance Criteria

* `checkout.schema.ts` exists and exports checkout request/response contracts
* Contracts include:
  * cart_id
  * idempotency key
  * explicit success/failure result shape
* JSDoc is present and consistent
* No imports from apps/infrastructure/ORM

## Dependencies

* CONTRACTS-51 — Cart/order identifier contracts
* CONTRACTS-52 — Cart intent contracts
* CONTRACTS-53 — Order and pricing snapshot contracts

## Estimated Effort

45–90 minutes
