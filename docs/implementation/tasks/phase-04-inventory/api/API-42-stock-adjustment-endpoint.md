# Task: API-42 — Implement stock adjustment endpoint (tenant-staff governed mutation)
Blueprint: Domain M (Inventory Governance & Consistency)
Phase: 04 Inventory

## Layer

api

## Package / Area

apps/api/src

## Purpose

Expose a tenant-scoped, governed endpoint for inventory stock adjustments.

This endpoint must make mutation explicit, validate contract inputs, enforce authorization, and produce an auditable outcome.

## Implementation Location

* apps/api/src/modules/inventory/inventory.controller.ts
* apps/api/src/modules/inventory/inventory.service.ts
* apps/api/src/http/guards/inventory.guard.ts (or inventory mutation guard)

## Implementation Notes

* Validate request using inventory mutation contracts.
* Authorization:
  * enforce tenant scope
  * require explicit permission/role for inventory mutation
  * deny-by-default
* Behavior:
  * fail closed on missing/invalid tenant context
  * idempotent handling if idempotency key is used
* Emit audit logging for mutation intent and outcome.

## Acceptance Criteria

* Endpoint exists for stock adjustment
* Request validated via contracts
* Authorization enforced (tenant-staff only with explicit permission)
* On success:
  * inventory is adjusted
  * response returns updated snapshot
  * an audit/event record is produced
* On failure:
  * no partial mutation occurs
  * response is clear and does not leak sensitive info

## Dependencies

* CONTRACTS-42 — Inventory mutation contracts
* DOMAIN-43 — Stock adjustment governed mutation
* PRISMA-42 — Define inventory audit / event persistence schema
* RLS-43 — Guarded mutation policies for inventory operations

## Estimated Effort

60–120 minutes
