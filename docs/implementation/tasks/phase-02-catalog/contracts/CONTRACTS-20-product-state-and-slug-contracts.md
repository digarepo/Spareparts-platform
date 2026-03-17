# Task: CONTRACTS-20 — Product state and slug contracts
Blueprints: Domain G (Product Catalog Core), Domain H (Catalog Visibility & Publication)
Phase: 02 Catalog

## Layer

contracts

## Package / Area

packages/contracts

## Purpose

Define product state and slug contracts for use across catalog, API, and domain
layers, using string-based codes (no enums) and URL-safe slugs suitable for
public catalog URLs.

## Implementation Location

packages/contracts/src/catalog/product-state.schema.ts

## Implementation Notes

* Implement a Zod + TypeScript module that exports:
  * `ProductSlugSchema` and `ProductSlug`
  * `ProductStatusSchema` and `ProductStatus`
* ProductSlug:
  * Lowercase
  * Hyphen-separated segments
  * URL-safe characters only
* ProductStatus:
  * String literal union (e.g. `"draft" | "published" | "inactive"`); do **not**
    use TypeScript `enum` or database enum types
  * Values must reflect publication semantics from Domain H while remaining
    purely descriptive (no implicit behavior)
* Documentation:
  * Module-level JSDoc describing slug and status semantics and boundaries
  * JSDoc for each schema and type export with usage examples
* Contracts must not:
  * Depend on ORM entities, HTTP types, or infrastructure details
  * Embed visibility, inventory, or pricing behavior

## Acceptance Criteria

* `product-state.schema.ts` exists in `packages/contracts/src/catalog/`
* `ProductSlugSchema` / `ProductSlug` and `ProductStatusSchema` / `ProductStatus` are exported
* Slug and status validation rules are enforced
* JSDoc is present and consistent with contracts documentation standards
* Implementation relies on string unions and Zod, not TypeScript or DB enums

## Dependencies

* CONTRACTS-01 — Catalog identifier contracts
* CONTRACTS-03 — Catalog entity contracts

## Estimated Effort

30–45 minutes

