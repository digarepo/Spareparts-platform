# Task: API-20 — Unify catalog controller surface for Phase 2
Blueprints: Domain A (Repository Architecture), Domain G (Product Catalog Core)
Phase: 02 Catalog

## Layer

api

## Package / Area

apps/api/src/http/controllers

## Purpose

Ensure there is a single, coherent controller surface for catalog product and
variant endpoints, using contracts for validation and types and tenant context
for isolation.

## Implementation Location

apps/api/src/http/controllers/

## Implementation Notes

* Controller structure:
  * Prefer a single catalog controller surface rather than multiple overlapping
    controllers (avoid `catalog.controller.ts` vs `catalog-products.controller.ts`
    duplication)
* Contracts integration:
  * Validate request bodies and query params using the Phase 2 contracts modules
  * Validate response shapes where practical
* Tenant isolation:
  * Require `TenantContext` for all tenant-scoped endpoints
  * Ensure downstream services set DB tenant context for RLS
* This task focuses on controller structure and wiring; endpoints are implemented
  in subsequent tasks.

## Acceptance Criteria

* Catalog controller surface is unified (no redundant controllers for the same routes)
* Controller depends on contracts and domain/application services, not ORM entities
* TenantContext is required and used for all tenant-scoped catalog operations

## Dependencies

* API-01 (Phase 01) — Tenant context pipeline
* CONTRACTS-20 through CONTRACTS-24 — Phase 2 catalog contracts

## Estimated Effort

45–60 minutes

