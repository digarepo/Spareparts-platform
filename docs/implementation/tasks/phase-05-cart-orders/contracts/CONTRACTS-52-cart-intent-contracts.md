# Task: CONTRACTS-52 — Implement cart intent contracts
Blueprint: Domain N (Cart & Order Intent Model)
Phase: 05 Cart & Orders

## Layer

contracts

## Package / Area

packages/contracts

## Purpose

Provide grouped contracts for cart intent so the system represents customer intent without creating commitment, obligations, reservations, payment state, or fulfillment meaning.

## Implementation Location

packages/contracts/src/checkout/cart.schema.ts
packages/contracts/src/checkout/cart-operations.schema.ts

## Implementation Notes

* `cart.schema.ts` should export:
  * `CartItemSchema` / `CartItem`
  * `CartSchema` / `Cart`
* Cart content semantics:
  * cart items reference catalog entities by ULID identifiers (`product_id`, `variant_id`)
  * cart items include intended quantity (integer, positive)
  * cart items may include observed price snapshot-at-addition as informational (must not be used as order pricing snapshot)
* `cart-operations.schema.ts` should export request/response shapes for:
  * add item
  * update item quantity
  * remove item
  * get cart
* Do not include inventory reservation or tenant operational visibility in cart contracts.
* Documentation:
  * Module-level JSDoc + per-export JSDoc for usage.

## Acceptance Criteria

* `cart.schema.ts` exists and exports `Cart` and `CartItem` contracts
* `cart-operations.schema.ts` exists and exports request/response contracts for cart mutation and retrieval
* Contracts validate:
  * ULID identifiers for catalog references
  * quantities as whole, positive integers
* JSDoc is present and consistent
* No imports from apps/infrastructure/ORM

## Dependencies

* CONTRACTS-01 — Catalog identifier contracts (ProductId/VariantId)
* CONTRACTS-51 — Cart/order identifier contracts

## Estimated Effort

60–90 minutes
