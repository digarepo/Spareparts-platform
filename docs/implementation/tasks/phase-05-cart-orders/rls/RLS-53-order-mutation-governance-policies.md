# Task: RLS-53 — Implement guarded order mutation policies (governed transitions)
Blueprint: Domain P (Order Transitions, Governance & Failure Semantics)
Phase: 05 Cart & Orders

## Layer

rls

## Package / Area

packages/db/rls

## Purpose

Ensure that order mutations and lifecycle transitions are structurally guarded and scope-bound at the database layer.

This task prevents cross-tenant and unauthorized order mutations.

## Implementation Location

* packages/db/rls/checkout.sql

## Implementation Notes

* Writes must be scope-bound:
  * Customer may only mutate orders where permitted (e.g., cancel if allowed by lifecycle).
  * Tenant staff may mutate only their tenant-scoped portions.
  * Platform staff must not mutate tenant orders.
* Writes must fail closed if context is missing.

## Acceptance Criteria

* Unauthorized order mutations are denied at DB level
* Cross-tenant mutations are denied
* Allowed mutations succeed within correct scope

## Dependencies

* RLS-52 — Tenant-isolated order line policies

## Estimated Effort

45–90 minutes
