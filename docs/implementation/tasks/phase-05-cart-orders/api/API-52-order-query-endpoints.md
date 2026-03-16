# Task: API-52 — Implement order query endpoints (customer + tenant views)
Blueprint: Domain N (Cart & Order Intent Model), Domain O (Order Lines & Pricing Snapshots)
Phase: 05 Cart & Orders

## Layer

api

## Package / Area

apps/api/src

## Purpose

Expose read-only endpoints for order retrieval:
- customers can see their own orders
- tenant staff can see tenant-isolated portions relevant to them

This must preserve multi-tenant isolation rules for line items.

## Implementation Location

* apps/api/src/modules/orders/orders.controller.ts
* apps/api/src/modules/orders/orders.service.ts

## Implementation Notes

* Customer scope:
  * return full order for that customer
* Tenant scope:
  * return only tenant’s line items and derived views
* Validate inputs and outputs using order contracts.

## Acceptance Criteria

* Customer can retrieve their orders
* Tenant staff can retrieve tenant-scoped order views
* Cross-tenant line leakage is prevented by RLS
* Responses conform to order contracts

## Dependencies

* CONTRACTS-53 — Order and pricing snapshot contracts
* RLS-52 — Tenant-isolated order line policies

## Estimated Effort

60–120 minutes
