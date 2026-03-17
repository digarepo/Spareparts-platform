# Task: RLS-42 — Implement tenant isolation policies for inventory reads
Blueprint: Domain B (Data & Environment Enforcement), Domain K (Inventory Core Model)
Phase: 04 Inventory

## Layer

rls

## Package / Area

packages/db/rls

## Purpose

Ensure inventory and reservation reads are tenant-isolated by database policy, so cross-tenant exposure is structurally impossible.

## Implementation Location

* packages/db/rls/inventory.sql

## Implementation Notes

* Inventory reads:
  * Allow tenant-scoped reads only when the active DB session tenant matches row tenant_id.
* Reservation reads:
  * Same tenant scoping as inventory.
* Event/audit reads:
  * Tenant can read its own events.
* Policies must not rely on application-level filtering.

## Acceptance Criteria

* Tenant A cannot read Tenant B inventory/reservations/events via direct SQL
* Tenant-scoped reads succeed when tenant context is set
* Policies are documented in the SQL file(s)

## Dependencies

* RLS-41 — Enable RLS on inventory, reservation, and inventory event tables

## Estimated Effort

30–60 minutes
