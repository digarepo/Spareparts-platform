# Task: API-41 — Implement inventory query endpoints (tenant-scoped)
Blueprint: Domain K (Inventory Core Model), Domain B (Data & Environment Enforcement)
Phase: 04 Inventory

## Layer

api

## Package / Area

apps/api/src

## Purpose

Expose read-only, tenant-scoped endpoints to query inventory state without allowing cross-tenant exposure.

These endpoints provide operational visibility for tenant staff and must not act as a source of truth beyond the inventory domain/database.

## Implementation Location

* apps/api/src/modules/inventory/inventory.controller.ts
* apps/api/src/modules/inventory/inventory.service.ts

## Implementation Notes

* Endpoints should:
  * require explicit tenant context
  * validate inputs with inventory contracts
  * return inventory snapshot contracts
* Query shapes:
  * by variant_id
  * list inventory for tenant with pagination
* Behavior:
  * fail closed on missing/invalid tenant context
  * do not leak inventory for other tenants

## Acceptance Criteria

* Controller exposes tenant-scoped inventory query endpoints
* Requests are validated via contracts
* Responses conform to inventory snapshot contracts
* Cross-tenant queries are rejected by RLS and do not return data

## Dependencies

* API-01 — Tenant context pipeline (Phase 01)
* CONTRACTS-44 — Inventory snapshot and event contracts
* PRISMA-41 — Define inventory and reservation persistence schema
* RLS-42 — Tenant isolation policies for inventory reads

## Estimated Effort

60–90 minutes
