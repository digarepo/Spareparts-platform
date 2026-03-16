# Task: RLS-51 — Implement customer-scope cart ownership policies
Blueprint: Domain N (Cart & Order Intent Model), Domain C (Identity, Scope, Authorization)
Phase: 05 Cart & Orders

## Layer

rls

## Package / Area

packages/db/rls

## Purpose

Enforce that carts are visible and mutable only within **customer scope** and only by the owning customer identity/context.

Tenants must never read or mutate carts.

## Implementation Location

* packages/db/rls/checkout.sql

## Implementation Notes

* Cart read/write policies must:
  * require customer scope
  * require customer identity match to cart owner
* Guest carts:
  * if supported, policies must use an explicit guest cart token/context and must remain isolated
* Tenant and platform scopes must not have cart write access.

## Acceptance Criteria

* Customer A cannot read/mutate Customer B carts
* Tenant scope cannot read/mutate carts
* Policies are documented and repeatable

## Dependencies

* RLS-50 — Enable RLS on cart, order, and related tables

## Estimated Effort

45–90 minutes
