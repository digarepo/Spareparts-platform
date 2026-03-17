# Task: CONTRACTS-02 — Implement catalog pricing contracts
Blueprint: Domain J (Pricing Assets Governance)
Phase: 01 Foundations

## Layer

contracts

## Package / Area

packages/contracts

## Purpose

Provide reusable pricing contracts for catalog entities, separating commercial terms
from product definition and inventory quantities.

## Implementation Location

packages/contracts/src/catalog/catalog-pricing.schema.ts

## Implementation Notes

* Implement a Zod + TypeScript module that exports:
  * `PriceSchema` and `Price`
* Price must:
  * Include a numeric `amount` (non-negative, finite)
  * Include a `currency` code (constrained to a supported format, e.g. ISO 4217)
* Documentation:
  * Module-level JSDoc explaining pricing contracts and their boundaries
  * JSDoc for `PriceSchema` / `Price` with examples
* Contracts must not:
  * Encode discounts, taxes, or availability logic
  * Depend on database entities or infrastructure types

## Acceptance Criteria

* `catalog-pricing.schema.ts` exists in `packages/contracts/src/catalog/`
* `PriceSchema` / `Price` are exported
* Validation enforces non-negative amount and valid currency code
* JSDoc is present and consistent with contracts documentation standards
* No imports from applications, infrastructure, or ORM entities

## Dependencies

* CONTRACTS-00 — Contracts package structure established

## Estimated Effort

30–45 minutes

