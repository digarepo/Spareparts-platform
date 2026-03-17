# Task: RLS-44 — Implement platform supervisory read-only policy for inventory
Blueprint: Domain C (Identity, Scope, Authorization), Domain W/X (Platform supervisory posture)
Phase: 04 Inventory

## Layer

rls

## Package / Area

packages/db/rls

## Purpose

Allow platform staff (platform scope) to perform supervisory, read-only observation of inventory state without enabling operational mutation of tenant data.

## Implementation Location

* packages/db/rls/inventory.sql

## Implementation Notes

* Platform supervisory access must be:
  * explicitly scoped (platform scope)
  * read-only
  * auditable at the application layer (not enforced by RLS, but must remain possible)
* No policy may allow platform-initiated mutation of tenant inventory.

## Acceptance Criteria

* Platform scope can read inventory/reservations/events across tenants when the DB session scope is platform supervisory
* Platform scope cannot write inventory/reservations/events
* No tenant bypass logic exists outside the explicit platform scope

## Dependencies

* RLS-42 — Tenant isolation policies for inventory reads

## Estimated Effort

30–60 minutes
