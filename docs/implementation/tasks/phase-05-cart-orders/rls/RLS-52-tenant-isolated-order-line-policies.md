# Task: RLS-52 — Implement tenant-isolated order line policies
Blueprint: Domain O (Order Lines & Pricing Snapshots), Domain B (Data & Environment Enforcement)
Phase: 05 Cart & Orders

## Layer

rls

## Package / Area

packages/db/rls

## Purpose

Ensure that tenant staff can access only their tenant’s order line items and derived order views, while customers can access their whole order without leaking cross-tenant tenant-internal details.

## Implementation Location

* packages/db/rls/checkout.sql

## Implementation Notes

* Orders are customer-owned but tenant-responsible:
  * Customer scope: read access to their orders.
  * Tenant scope: read access limited to their tenant’s line items and tenant-scoped operational fields.
* Platform scope: supervisory read-only may exist, but must not mutate tenant orders.

## Acceptance Criteria

* Tenant A staff cannot read Tenant B line items
* Customer can read their own order
* Platform scope does not gain mutation capability

## Dependencies

* RLS-50 — Enable RLS on cart, order, and related tables

## Estimated Effort

45–90 minutes
