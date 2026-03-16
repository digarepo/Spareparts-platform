# Task: API-01 — Implement tenant context pipeline
Blueprint: Domain B (Data & Environment Enforcement)
Phase: 01 Foundations

## Layer

api

## Package / Area

apps/api/src/http

## Purpose

Introduce a validated TenantContext at the API boundary and propagate it through
the NestJS request pipeline to all downstream handlers and data access.

## Implementation Location

* apps/api/src/http/middleware/tenant-context.middleware.ts
* apps/api/src/http/request/tenant-context.ts
* Any necessary wiring in the main API module

## Implementation Notes

* Middleware:
  * Read tenant identity from the request (JWT claims or headers)
  * Validate and normalize into a `TenantContext` using contracts
  * Attach `TenantContext` to the NestJS request object or a request-scoped provider
* Helper:
  * Provide a typed accessor for `TenantContext` inside controllers and services
* Environment & database:
  * Ensure the Postgres session has the tenant id set where required for RLS
    (in collaboration with the DB / RLS tasks)
* Behavior:
  * Fail closed when tenant context is missing or invalid
  * Log but do not leak sensitive tenant info

## Acceptance Criteria

* Tenant context middleware is registered in the NestJS API pipeline
* Valid requests receive a `TenantContext` accessible from controllers/services
* Invalid or missing tenant context results in a clear 4xx response and no data access
* Implementation uses contracts for tenant context shape (no ad-hoc types)
* Tests or manual verification cover:
  * Valid tenant context propagation
  * Rejection on invalid/missing tenant info

## Dependencies

* CONTRACTS-05 — Tenant context contracts implemented
* DB-02 / DB-03 — Tenant model and tenant-scoped tables defined

## Estimated Effort

60–90 minutes

