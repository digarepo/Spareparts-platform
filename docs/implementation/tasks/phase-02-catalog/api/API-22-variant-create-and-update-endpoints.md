# Task: API-22 — Implement variant create and update endpoints
Blueprint: Domain G (Product Catalog Core)
Phase: 02 Catalog

## Layer

api

## Package / Area

apps/api/src/http/controllers

## Purpose

Implement variant mutation endpoints using contracts validation and tenant-scoped
data access, supporting SKU and variant attribute updates without leaking
business rules into the controller.

## Implementation Location

Unified catalog controller under:
* apps/api/src/http/controllers/...

## Implementation Notes

* Endpoints:
  * `POST /catalog/products/:id/variants` — create a variant for a product
  * `PATCH /catalog/variants/:id` — update variant (SKU, attributes, etc.)
* Validation:
  * Use `VariantCreateRequest` and `VariantUpdateRequest` contracts
  * Use `ProductId` and `VariantId` contracts for path params and references
* Tenant isolation:
  * Require `TenantContext`
  * Ensure database writes/reads are tenant-scoped and RLS-protected
* Audit:
  * If variant changes are considered governed actions, record them via a
    history/audit table or append-only change log (can be introduced in a later phase)

## Acceptance Criteria

* Variant create and update endpoints exist and are wired
* Request payloads validated via contracts
* Tenant scope is enforced for all reads and writes
* SKU uniqueness constraints are respected at the DB layer

## Dependencies

* API-20 — Unify catalog controller surface for Phase 2
* CONTRACTS-22 — Variant mutation request contracts
* DB-21 — Extend Variant model for SKU and attributes
* RLS policies for variant tables must already exist (Phase 01 RLS)

## Estimated Effort

75–120 minutes

