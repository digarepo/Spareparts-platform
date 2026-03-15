# Task: DOMAIN-54 — Implement inventory interaction during checkout (explicit, non-implicit)
Blueprint: Domain N (Cart & Order Intent Model), Domain P (Order Transitions, Governance & Failure Semantics)
Phase: 05 Cart & Orders

## Layer

domain

## Package / Area

domains/checkout

## Purpose

Define and implement the explicit interaction point between checkout and inventory such that:
- carts do not control inventory
- order creation does not implicitly guarantee inventory
- inventory actions (reservation/allocation) remain separate governed operations

## Implementation Location

* domains/checkout/src/checkout/inventory-ports.ts
* domains/checkout/src/checkout/checkout.service.ts

## Implementation Notes

* The checkout domain must integrate with inventory via an explicit port/interface.
* Decide whether checkout uses:
  * reservations
  * allocations
  * or a two-step flow
  while keeping the hard boundaries from the blueprints.
* Any inventory action must be explicitly invoked and auditable.

## Acceptance Criteria

* A checkout-to-inventory port exists
* Checkout service uses the port explicitly (no hidden side effects)
* Behavior is explainable in audit logs and does not blur boundaries

## Dependencies

* DOMAIN-52 — Cart-to-order transition
* Phase 04 inventory tasks (reservation/allocation contracts and API)

## Estimated Effort

60–120 minutes
