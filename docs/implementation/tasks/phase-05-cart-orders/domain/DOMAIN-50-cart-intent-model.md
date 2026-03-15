# Task: DOMAIN-50 — Implement Cart intent model and invariants
Blueprint: Domain N (Cart & Order Intent Model)
Phase: 05 Cart & Orders

## Layer

domain

## Package / Area

domains/checkout (or domains/cart-orders)

## Purpose

Implement the cart intent model as a mutable, reversible, customer-scoped construct that never creates commitment or obligation.

## Implementation Location

* domains/checkout/src/cart/cart.entity.ts
* domains/checkout/src/cart/cart-item.entity.ts
* domains/checkout/src/cart/cart.service.ts

## Implementation Notes

* Cart ownership:
  * cart belongs to exactly one customer context
  * cart exists in customer scope only
* Cart semantics:
  * cart items reference catalog product/variant ids
  * cart stores intended quantity as whole positive integer
  * cart may store observed price at time of addition as informational only
* Cart must not:
  * reserve inventory
  * mutate inventory/pricing/catalog
  * imply payment
  * imply fulfillment

## Acceptance Criteria

* Cart entity and CartItem entity exist
* Domain methods exist for:
  * add item
  * update quantity
  * remove item
  * clear cart (optional)
* Invariants enforced (no negative/zero quantities for items)
* No imports from apps or infrastructure

## Dependencies

* PRISMA-50 — Define cart and order persistence schema
* CONTRACTS-52 — Cart intent contracts

## Estimated Effort

60–120 minutes
