# Task: API-44 — Implement inventory authorization and mutation guard
Blueprint: Domain C (Identity, Scope, Authorization), Domain M (Inventory Governance & Consistency)
Phase: 04 Inventory

## Layer

api

## Package / Area

apps/api/src/http/guards

## Purpose

Enforce that inventory mutations (adjustments, reservation create/release) occur only when:
- identity is authenticated
- active scope is tenant
- required permissions/roles are present

The guard must not implement business logic; it enforces authorization boundaries and fail-closed behavior.

## Implementation Location

* apps/api/src/http/guards/inventory.guard.ts

## Implementation Notes

* Guard must:
  * require tenant context
  * enforce scope-first authorization
  * deny by default
  * produce auditable authorization failures
* Guard must not:
  * compute available quantity
  * alter inventory state

## Acceptance Criteria

* Guard exists and is wired to mutation endpoints
* Unauthorized requests are rejected with clear 4xx responses
* Authorized tenant-staff requests pass
* No inventory mutation occurs if guard rejects

## Dependencies

* API-01 — Tenant context pipeline
* Phase 03 IAM tasks (roles/permissions enforcement) as applicable

## Estimated Effort

45–90 minutes
