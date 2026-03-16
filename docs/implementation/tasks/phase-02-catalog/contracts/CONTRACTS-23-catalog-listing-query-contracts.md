# Task: CONTRACTS-23 — Catalog listing query contracts
Blueprints: Domain G (Product Catalog Core), Domain H (Catalog Visibility & Publication), Domain I (Taxonomy Classification)
Phase: 02 Catalog

## Layer

contracts

## Package / Area

packages/contracts

## Purpose

Define request contracts for catalog listing and filtering so APIs and domains
share a common shape for listing products with pagination, status, and taxonomy
filters.

## Implementation Location

packages/contracts/src/catalog/catalog-listing.request.ts

## Implementation Notes

* Implement a Zod + TypeScript module that exports:
  * `CatalogListQuerySchema` and `CatalogListQuery`
* Query should support:
  * Pagination (e.g. page/limit or cursor-based)
  * Filtering by product status (string codes from ProductStatus)
  * Optional taxonomy/category filters
  * Optional free-text search term (if desired in this phase)
* Documentation:
  * Module-level JSDoc describing listing/filter semantics and non-goals
  * JSDoc for schema/type with field descriptions
* Contracts must not:
  * Encode presentation-layer details (sorting UI, facets, etc.)
  * Depend on HTTP-specific libraries

## Acceptance Criteria

* `catalog-listing.request.ts` exists in `packages/contracts/src/catalog/`
* `CatalogListQuerySchema` / `CatalogListQuery` are exported
* Validation rules cover pagination and filters appropriately
* JSDoc is present and consistent with contracts documentation standards

## Dependencies

* CONTRACTS-03 — Catalog entity contracts
* CONTRACTS-20 — Product state and slug contracts
* CONTRACTS-24 — Taxonomy contracts (if taxonomy filters are included)

## Estimated Effort

45–60 minutes

