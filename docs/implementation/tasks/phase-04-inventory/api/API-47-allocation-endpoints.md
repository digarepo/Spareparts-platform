# Task: API-47 — Implement inventory allocation endpoints
Blueprint: Domain L (Inventory Availability & Reservation), Domain M (Inventory Governance & Consistency)
Phase: 04 Inventory

## Layer

api

## Package / Area

apps/api/src

## Purpose

Expose tenant-scoped endpoints to allocate and release allocated inventory as explicit governed actions.

These endpoints support downstream execution readiness while keeping allocation distinct from reservation.

## Implementation Location

* apps/api/src/modules/inventory/inventory.controller.ts
* apps/api/src/modules/inventory/inventory.service.ts

## Implementation Notes

* Validate requests using allocation contracts.
* Enforce tenant scope and explicit authorization.
* Emit audit logging for intent/outcome.

## Acceptance Criteria

* Endpoints exist:
  * allocate inventory
  * release allocation
* Requests validated via contracts
* Authorization enforced and deny-by-default
* Result includes updated snapshot
* Allocation operations produce audit/event records

## Dependencies

* CONTRACTS-46 — Inventory allocation contracts
* DOMAIN-46 — Allocation semantics
* API-44 — Inventory authorization and mutation guard
* RLS-43 — Guarded mutation policies for inventory operations

## Estimated Effort

60–120 minutes
