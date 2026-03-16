# Task: DOMAIN-20 — Catalog product aggregate and publication rules
Blueprints: Domain G (Product Catalog Core), Domain H (Catalog Visibility & Publication), Domain J (Pricing Assets Governance)
Phase: 02 Catalog

## Layer

domain

## Package / Area

domains/catalog

## Purpose

Define a catalog Product aggregate and implement core domain functions for slug
generation, publication validation, and visibility rules, independent of
infrastructure and HTTP concerns.

## Implementation Location

domains/catalog/

## Implementation Notes

* Create or extend:
  * `domains/catalog/product.aggregate.ts` for the Product aggregate root
  * `domains/catalog/functions/` for pure domain functions
* Implement functions such as:
  * `generateProductSlug(...)` — uses product name or inputs and applies slug rules
  * `canPublishProduct(...)` — enforces publication preconditions from Domain H
  * `determineProductVisibility(...)` — derives visibility flags from product state
* Functions must:
  * Use catalog contracts for Product, ProductStatus, and Price where relevant
  * Not perform database access or HTTP I/O
  * Enforce invariants without encoding inventory or order behavior

## Acceptance Criteria

* Product aggregate type and supporting functions exist in `domains/catalog/`
* Slug generation, publication guard, and visibility rule functions are implemented
* Functions rely on contracts for types and remain pure domain logic

## Dependencies

* DOMAIN-00 — Establish domain package structure
* CONTRACTS-02 — Catalog pricing contracts
* CONTRACTS-03 — Catalog entity contracts
* CONTRACTS-20 — Product state and slug contracts

## Estimated Effort

60–120 minutes

