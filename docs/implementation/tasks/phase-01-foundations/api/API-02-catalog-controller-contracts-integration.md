# Task: API-02 — Implement catalog controller with contracts integration
Blueprints: Domain G (Product Catalog Core), Domain H (Catalog Visibility & Publication)
Phase: 01 Foundations

## Layer

api

## Package / Area

apps/api/src/http/controllers

## Purpose

Create a catalog controller that uses contracts for input/output types and is ready
to host product-related endpoints while respecting tenant context.

## Implementation Location

apps/api/src/http/controllers/catalog.controller.ts

## Implementation Notes

* Implement a NestJS controller for catalog operations:
  * Decorate with appropriate route prefix (e.g. `/catalog`)
  * Inject any required services via constructor
* Integrate contracts:
  * Use catalog contracts types for DTOs and method signatures where possible
  * Accept `TenantContext` from the tenant context pipeline
* This task focuses on structure and contracts integration; specific endpoints
  are implemented in the next task.

## Acceptance Criteria

* `catalog.controller.ts` exists and is registered in the API module
* Controller depends on contracts and tenant context types, not ORM entities
* No business logic or persistence logic is implemented inline in this task

## Dependencies

* API-01 — Implement tenant context pipeline
* CONTRACTS-01 through CONTRACTS-03 — Catalog contracts

## Estimated Effort

30–45 minutes

