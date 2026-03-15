# Task: CONTRACTS-56 — Export checkout contracts public surface
Blueprint: Domain A (Repository & Package Architecture)
Phase: 05 Cart & Orders

## Layer

contracts

## Package / Area

packages/contracts

## Purpose

Provide a stable public export surface for checkout/cart/order contracts so API and domain layers use consistent imports.

## Implementation Location

packages/contracts/src/checkout/index.ts

## Implementation Notes

* Re-export:
  * identifiers
  * cart contracts
  * cart operations
  * order + pricing snapshot
  * checkout transition
  * order events

## Acceptance Criteria

* `packages/contracts/src/checkout/index.ts` exists
* All checkout-related contract modules are re-exported

## Dependencies

* CONTRACTS-51 — Cart/order identifier contracts
* CONTRACTS-52 — Cart intent contracts
* CONTRACTS-53 — Order and pricing snapshot contracts
* CONTRACTS-54 — Checkout transition contracts
* CONTRACTS-55 — Order event and audit contracts

## Estimated Effort

15–30 minutes
