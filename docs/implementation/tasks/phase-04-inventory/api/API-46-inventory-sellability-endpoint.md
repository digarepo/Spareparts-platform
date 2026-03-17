# Task: API-46 — Implement inventory sellability endpoint (tenant-scoped)
Blueprint: Domain L (Inventory Availability & Reservation), Domain M (Inventory Governance & Consistency)
Phase: 04 Inventory

## Layer

api

## Package / Area

apps/api/src

## Purpose

Expose a tenant-scoped endpoint to explicitly set inventory sellability, with governed mutation semantics and auditability.

## Implementation Location

* apps/api/src/modules/inventory/inventory.controller.ts
* apps/api/src/modules/inventory/inventory.service.ts

## Implementation Notes

* Validate request using sellability contracts.
* Enforce tenant scope and explicit authorization (inventory mutation permission).
* Emit audit logging for intent and outcome.

## Acceptance Criteria

* Endpoint exists to set sellable true/false for a variant within a tenant
* Request validated via contracts and includes a reason
* Authorization enforced and deny-by-default
* Result includes updated snapshot/sellability representation
* An audit/event record is produced

## Dependencies

* CONTRACTS-45 — Inventory sellability and policy contracts
* DOMAIN-45 — Inventory sellability governance
* RLS-43 — Guarded mutation policies for inventory operations

## Estimated Effort

45–90 minutes
