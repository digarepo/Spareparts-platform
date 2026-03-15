# Task: CONTRACTS-51 — Implement cart/order identifier contracts
Blueprint: Domain N (Cart & Order Intent Model), Domain O (Order Lines & Pricing Snapshots)
Phase: 05 Cart & Orders

## Layer

contracts

## Package / Area

packages/contracts

## Purpose

Define stable, opaque identifier contracts required by cart and order workflows using ULID strings.

Identifiers must be usable across applications, domains, and infrastructure without exposing persistence details.

## Implementation Location

packages/contracts/src/checkout/checkout-identifiers.schema.ts

## Implementation Notes

* Implement a Zod + TypeScript module that exports:
  * `CartIdSchema` / `CartId` (ULID string)
  * `OrderIdSchema` / `OrderId` (ULID string)
  * `OrderLineIdSchema` / `OrderLineId` (ULID string)
  * `PricingSnapshotIdSchema` / `PricingSnapshotId` (ULID string)
  * `OrderEventIdSchema` / `OrderEventId` (ULID string)
* Validation:
  * Validate canonical ULID strings via the shared ULID pattern/helper.
* Documentation:
  * Module-level JSDoc describing what each identifier represents.
  * JSDoc per schema/type export.
* Contracts must not:
  * Encode business meaning in identifier formats
  * Depend on framework, database, or application types

## Acceptance Criteria

* `checkout-identifiers.schema.ts` exists in `packages/contracts/src/checkout/`
* All identifier schemas/types are exported and validate ULID strings
* Invalid identifiers are rejected by validation
* JSDoc is present and consistent with contracts documentation standards
* No imports from applications, infrastructure, or ORM entities

## Dependencies

* CONTRACTS-50 — Establish cart & order contracts structure (Phase 5)
* CONTRACTS-01 — Catalog identifier contracts (ULID conventions)

## Estimated Effort

30–45 minutes
