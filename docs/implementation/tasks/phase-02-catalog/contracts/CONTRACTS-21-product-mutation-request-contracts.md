# Task: CONTRACTS-21 — Product mutation request contracts
Blueprint: Domain G (Product Catalog Core)
Phase: 02 Catalog

## Layer

contracts

## Package / Area

packages/contracts

## Purpose

Define create and update request contracts for products, to be used by catalog
APIs and domain services when mutating product data.

## Implementation Location

packages/contracts/src/catalog/product-mutation.request.ts

## Implementation Notes

* Implement a Zod + TypeScript module that exports:
  * `ProductCreateRequestSchema` and `ProductCreateRequest`
  * `ProductUpdateRequestSchema` and `ProductUpdateRequest`
* Requests must:
  * Use `ProductSlug` and `ProductStatus` contracts
  * Reference product-related contracts (e.g. `Product`) where appropriate
* Create request:
  * Includes required fields for initial product definition (e.g. name, slug,
    description, initial status)
* Update request:
  * Supports partial updates with clear optional fields
* Documentation:
  * Module-level JSDoc describing product mutation contracts
  * JSDoc for each schema/type with input examples
* Contracts must not:
  * Depend on HTTP-specific types (e.g. NestJS DTO decorators)
  * Embed persistence or infrastructure concerns

## Acceptance Criteria

* `product-mutation.request.ts` exists in `packages/contracts/src/catalog/`
* Create and update request schemas and types are exported
* Validation rules match catalog product semantics
* JSDoc is present and consistent with contracts documentation standards

## Dependencies

* CONTRACTS-03 — Catalog entity contracts
* CONTRACTS-20 — Product state and slug contracts

## Estimated Effort

45–60 minutes

