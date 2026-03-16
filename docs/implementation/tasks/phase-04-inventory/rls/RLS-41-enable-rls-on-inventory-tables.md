# Task: RLS-41 — Enable RLS on inventory, reservation, and inventory event tables
Blueprint: Domain B (Data & Environment Enforcement), Domain K (Inventory Core Model)
Phase: 04 Inventory

## Layer

rls

## Package / Area

packages/db/rls

## Purpose

Activate Row Level Security (RLS) for all inventory-authoritative tables so tenant isolation is enforced at the database layer, not in application logic.

## Implementation Location

* packages/db/rls/inventory.sql (or split into inventory + reservations + events sql files if already structured that way)

## Implementation Notes

* Enable RLS on:
  * inventory table
  * inventory reservations table
  * inventory events/audit table
* Ensure policies rely on tenant context set on the Postgres session (per the existing tenant context pipeline rules).
* Fail closed:
  * default policy should not allow reads/writes without valid tenant context.

## Acceptance Criteria

* RLS is enabled on the inventory, reservation, and event tables
* Attempted access without tenant context is denied
* RLS scripts are committed and can be applied in a repeatable way

## Dependencies

* PRISMA-41 — Define inventory and reservation persistence schema
* PRISMA-42 — Define inventory audit / event persistence schema

## Estimated Effort

20–40 minutes
