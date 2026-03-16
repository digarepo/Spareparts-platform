# Task: CONTRACTS-01 — Implement catalog identifier contracts
Blueprint: Domain G (Product Catalog Core)
Phase: 01 Foundations

## Layer

contracts

## Package / Area

packages/contracts

## Purpose

Define stable, opaque identifier contracts for catalog entities using ULID strings,
to be shared across applications, domains, and infrastructure.

## Implementation Location

packages/contracts/src/catalog/catalog-identifiers.schema.ts

## Implementation Notes

* Implement a Zod + TypeScript module that exports:
  * `ProductIdSchema` and `ProductId` (ULID string)
  * `VariantIdSchema` and `VariantId` (ULID string)
* Validation:
  * Validate canonical ULID strings via a shared ULID pattern or helper
* Documentation:
  * Add module-level JSDoc describing catalog identifiers and their role
  * Add JSDoc for each schema and type export with usage guidance and examples
* Contracts must not:
  * Encode business meaning in identifier format
  * Depend on framework, database, or application types

## Acceptance Criteria

* `catalog-identifiers.schema.ts` exists in `packages/contracts/src/catalog/`
* `ProductIdSchema` / `ProductId` and `VariantIdSchema` / `VariantId` are exported
* Both identifiers validate ULID strings and reject invalid values
* JSDoc is present and consistent with contracts documentation standards
* No imports from applications, infrastructure, or ORM entities

## Dependencies

* CONTRACTS-00 — Contracts package structure established
* Architectural decision: internal identifiers use ULID strings

## Estimated Effort

30–45 minutes

