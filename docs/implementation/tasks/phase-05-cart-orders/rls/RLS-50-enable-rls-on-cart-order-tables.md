# Task: RLS-50 — Enable RLS on cart, order, and related tables
Blueprint: Domain B (Data & Environment Enforcement), Domain N (Cart & Order Intent Model)
Phase: 05 Cart & Orders

## Layer

rls

## Package / Area

packages/db/rls

## Purpose

Activate Row Level Security (RLS) for cart/order-related tables so identity/scope boundaries and tenant isolation are enforced at the database layer.

## Implementation Location

* packages/db/rls/checkout.sql (or an equivalent SQL file for cart/orders)

## Implementation Notes

* Enable RLS on:
  * carts
  * cart_items
  * orders
  * order_lines
  * pricing_snapshots
  * order_events
* Policies must rely on explicit DB session context (scope + identity + tenant, where applicable).
* Fail closed:
  * default policy must deny reads/writes without required context.

## Acceptance Criteria

* RLS is enabled on all cart/order/pricing snapshot/event tables
* Access without proper scope/context is denied
* RLS scripts are committed and repeatable

## Dependencies

* PRISMA-50 — Define cart and order persistence schema
* PRISMA-52 — Define order event/audit persistence schema

## Estimated Effort

30–60 minutes
