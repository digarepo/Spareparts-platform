# Task: DOMAIN-03 — Implement pricing snapshot and publication guard
Blueprints: Domain G (Product Catalog Core), Domain H (Catalog Visibility & Publication), Domain J (Pricing Assets Governance)
Phase: 01 Foundations

## Layer

domain

## Package / Area

domains/catalog

## Purpose

Provide catalog domain functions to:
* Capture a pricing snapshot suitable for downstream use (e.g. orders)
* Guard product publication based on pricing and catalog invariants

## Implementation Location

domains/catalog/functions/

## Implementation Notes

* Implement pure domain functions such as:
  * `createPriceSnapshot(...)`
  * `canPublishProduct(...)`
* Functions must:
  * Use catalog contracts for Product, Variant, and Price
  * Respect blueprint rules separating product identity, pricing, and visibility
* Publication guard should:
  * Enforce that publication is explicit and auditable
  * Not auto-publish based on inventory or price alone
* Do not:
  * Perform persistence or API I/O in these functions
  * Depend on HTTP, ORM, or infrastructure services

## Acceptance Criteria

* One or more functions exist in `domains/catalog/functions/` for pricing snapshot and publication guard
* Functions rely on contracts for input/output shapes
* TypeScript types and invariants from blueprints are enforced

## Dependencies

* DOMAIN-00 — Establish domain package structure
* CONTRACTS-02 — Catalog pricing contracts
* CONTRACTS-03 — Catalog entity contracts

## Estimated Effort

60–90 minutes

