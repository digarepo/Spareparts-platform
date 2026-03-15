# Task: API-21 — Implement product update, listing, and publish endpoints
Blueprints: Domain G (Product Catalog Core), Domain H (Catalog Visibility & Publication), Domain B (Data & Environment Enforcement)
Phase: 02 Catalog

## Layer

api

## Package / Area

apps/api/src/http/controllers

## Purpose

Implement Phase 2 product endpoints for updating products, listing products with
filters, and publishing/unpublishing products, with full contract validation,
tenant isolation, and audit/history recording.

## Implementation Location

Unified catalog controller under:
* apps/api/src/http/controllers/...

## Implementation Notes

* Endpoints:
  * `PATCH /catalog/products/:id` — update product fields
  * `GET /catalog/products` — list products with filters (status, taxonomy, search)
  * `POST /catalog/products/:id/publish` — publish product (explicit action)
  * (Optional) `POST /catalog/products/:id/unpublish` — withdraw from sale
* Validation:
  * Use `ProductUpdateRequest` and `CatalogListQuery` contracts
  * Use `ProductStatus` contract for allowed status transitions
* Tenant isolation:
  * Require `TenantContext` and ensure all queries/mutations are tenant-scoped
  * Ensure Postgres tenant session variable is set for RLS enforcement
* Audit:
  * Record status transitions and publication actions in DB history tables
    (DB-25) with actor identity and timestamps
  * Do not rely on logs as the audit trail

## Acceptance Criteria

* Endpoints exist and are wired in the unified catalog controller
* Requests are validated via contracts; invalid payloads are rejected
* All operations are tenant-scoped and enforced by RLS
* Status and publication events are persisted to history tables for auditability

## Dependencies

* API-20 — Unify catalog controller surface for Phase 2
* CONTRACTS-20, CONTRACTS-21, CONTRACTS-23 — Product state/mutation/listing contracts
* DB-20, DB-24, DB-25 — Product state fields, lookup governance, and audit tables
* RLS-20/21 — Catalog-related RLS policies in place

## Estimated Effort

90–150 minutes

