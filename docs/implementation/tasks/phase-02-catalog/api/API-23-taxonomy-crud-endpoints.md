# Task: API-23 — Implement taxonomy CRUD endpoints
Blueprint: Domain I (Taxonomy, Classification & Navigation)
Phase: 02 Catalog

## Layer

api

## Package / Area

apps/api/src/http/controllers

## Purpose

Expose taxonomy CRUD endpoints for managing categories and classification
structure, enforcing governance and isolation rules so taxonomy remains
descriptive and auditable.

## Implementation Location

apps/api/src/http/controllers/...

## Implementation Notes

* Endpoints:
  * Create, update, delete taxonomy nodes/categories
  * Assign/unassign products to taxonomy nodes (classification assignment)
* Authorization:
  * Enforce explicit role/scope rules for who can mutate taxonomy
  * If platform-owned taxonomy is used, restrict mutation to platform operators
* Validation:
  * Use taxonomy contracts (`TaxonomyId`, `TaxonomyNode`) and request schemas
    as needed
* Audit:
  * Record taxonomy changes and product assignment changes in history tables
    (DB-26 for assignments; taxonomy node history may be added if required)
* Ensure taxonomy:
  * Does not control product identity, pricing, inventory, or visibility

## Acceptance Criteria

* Taxonomy CRUD endpoints exist and validate inputs via contracts
* Product classification assignment endpoints exist and are auditable
* Tenant/platform scoping rules are enforced for taxonomy mutations
* RLS policies prevent cross-tenant leakage where tenant participation exists

## Dependencies

* CONTRACTS-24 — Taxonomy contracts
* DB-22 — Taxonomy models and relations
* DB-26 — Taxonomy assignment history
* RLS-20 and RLS-21 — Taxonomy-related RLS enabled and policies implemented

## Estimated Effort

90–150 minutes

