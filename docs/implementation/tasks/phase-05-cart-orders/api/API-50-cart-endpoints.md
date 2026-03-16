# Task: API-50 — Implement cart endpoints (customer-scope)
Blueprint: Domain N (Cart & Order Intent Model)
Phase: 05 Cart & Orders

## Layer

api

## Package / Area

apps/api/src

## Purpose

Expose customer-scope endpoints to create/retrieve/mutate cart intent without creating commitment or invoking inventory/payment/fulfillment side effects.

## Implementation Location

* apps/api/src/modules/checkout/cart.controller.ts
* apps/api/src/modules/checkout/cart.service.ts

## Implementation Notes

* Endpoints should:
  * require explicit customer scope (or explicit guest cart token if supported)
  * validate inputs via cart contracts
  * fail closed on missing/invalid context
* Endpoints must not:
  * reserve inventory
  * create orders
  * expose tenant internal information

## Acceptance Criteria

* Cart endpoints exist:
  * get cart
  * add item
  * update quantity
  * remove item
* Requests validated via contracts
* Responses conform to cart contracts
* Tenant scope cannot access cart endpoints

## Dependencies

* CONTRACTS-52 — Cart intent contracts
* RLS-51 — Customer-scope cart ownership policies

## Estimated Effort

60–120 minutes
