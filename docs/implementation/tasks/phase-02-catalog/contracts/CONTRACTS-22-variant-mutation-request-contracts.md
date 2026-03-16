# Task: CONTRACTS-22 — Variant mutation request contracts
Blueprint: Domain G (Product Catalog Core)
Phase: 02 Catalog

## Layer

contracts

## Package / Area

packages/contracts

## Purpose

Define create and update request contracts for variants, including SKU and
variant-defining attributes, for use by catalog APIs and domain services.

## Implementation Location

packages/contracts/src/catalog/variant-mutation.request.ts

## Implementation Notes

* Implement a Zod + TypeScript module that exports:
  * `VariantCreateRequestSchema` and `VariantCreateRequest`
  * `VariantUpdateRequestSchema` and `VariantUpdateRequest`
* Requests must:
  * Use `ProductId` and `VariantId` contracts
  * Use shared quantity and unit contracts where relevant
  * Represent SKU as a string field (no enums) aligned with DB model
* Create request:
  * Defines required variant-defining attributes and SKU
* Update request:
  * Allows partial updates while preserving invariant that variant identity
    remains tied to a single product
* Documentation:
  * Module-level JSDoc describing variant mutation contracts
  * JSDoc for each schema/type with usage examples
* Contracts must not:
  * Depend on HTTP-specific libraries
  * Leak inventory, pricing, or order semantics

## Acceptance Criteria

* `variant-mutation.request.ts` exists in `packages/contracts/src/catalog/`
* Create and update variant request schemas and types are exported
* Validation rules match variant and SKU semantics
* JSDoc is present and consistent with contracts documentation standards

## Dependencies

* CONTRACTS-01 — Catalog identifier contracts
* CONTRACTS-03 — Catalog entity contracts
* CONTRACTS-04 — Shared quantity and unit contracts

## Estimated Effort

45–60 minutes

