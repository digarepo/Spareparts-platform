# Task: DOMAIN-52 — Implement cart-to-order transition (explicit commitment)
Blueprint: Domain P (Order Transitions, Governance & Failure Semantics)
Phase: 05 Cart & Orders

## Layer

domain

## Package / Area

domains/checkout

## Purpose

Implement the explicit, one-way cart-to-order transition so customer intent becomes commitment exactly once per explicit trigger.

## Implementation Location

* domains/checkout/src/checkout/checkout.service.ts

## Implementation Notes

* Preconditions for order creation:
  * explicit customer intent
  * valid identity attribution (customer or explicit guest)
  * catalog references valid at transition time
  * pricing snapshots can be captured
  * authorization is valid
* Transition invariants:
  * create zero or one order per explicit attempt
  * no partial order creation
  * idempotent behavior under retries (no duplicate commitments)
* Post transition:
  * cart may be cleared/archived/discarded without affecting order correctness

## Acceptance Criteria

* Checkout transition method exists
* No partial/ghost orders are produced on failure
* Duplicate attempts do not create duplicate orders
* Result explicitly indicates success or failure

## Dependencies

* DOMAIN-50 — Cart intent model and invariants
* DOMAIN-51 — Order commitment model
* CONTRACTS-54 — Checkout transition contracts

## Estimated Effort

90–180 minutes
