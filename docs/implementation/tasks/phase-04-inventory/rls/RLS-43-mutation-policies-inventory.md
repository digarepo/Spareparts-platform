# Task: RLS-43 — Implement guarded mutation policies for inventory operations
Blueprint: Domain M (Inventory Governance & Consistency), Domain B (Data & Environment Enforcement)
Phase: 04 Inventory

## Layer

rls

## Package / Area

packages/db/rls

## Purpose

Ensure inventory mutations and reservation mutations are tenant-scoped and structurally guarded at the DB layer.

This task enforces that writes cannot occur without valid tenant context and cannot cross tenant boundaries.

## Implementation Location

* packages/db/rls/inventory.sql

## Implementation Notes

* Inventory mutations:
  * allow updates/inserts only when row tenant_id matches session tenant
  * disallow updates that would violate basic invariants if enforceable via SQL (additional check constraints in Prisma are authoritative)
* Reservation mutations:
  * allow insert/release updates only within tenant scope
  * ensure reservation rows cannot be reassigned across tenants
* Event insert:
  * allow append-only inserts within tenant scope

## Acceptance Criteria

* Cross-tenant writes are denied
* Writes without tenant context are denied
* Tenant-scoped writes succeed
* Policies are committed and repeatable

## Dependencies

* RLS-41 — Enable RLS on inventory, reservation, and inventory event tables
* PRISMA-43 — Generate/apply inventory migrations and verify constraints

## Estimated Effort

45–75 minutes
