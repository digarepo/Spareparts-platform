# Task: CONTRACTS-03 — Implement catalog entity contracts (Product & Variant)
Blueprint: Domain G (Product Catalog Core), Domain H (Catalog Visibility & Publication)
Phase: 01 Foundations

## Layer

contracts

## Package / Area

packages/contracts

## Purpose

Define Product and Variant contracts that reflect catalog semantics:
tenant-owned products, variant-defining attributes, and separation from inventory,
pricing, and visibility concerns.

## Implementation Location

packages/contracts/src/catalog/product.schema.ts

## Implementation Notes

* Implement a Zod + TypeScript module that exports:
  * `ProductSchema` and `Product`
  * `VariantSchema` and `Variant`
* Both schemas must:
  * Use `ProductId` and `VariantId` from catalog identifier contracts
  * Include tenant ownership fields consistent with Domain G (single owning tenant)
* Product:
  * Represents the semantic part concept
  * Separates structural/variant-defining/descriptive attributes per blueprint
* Variant:
  * Represents a specific sellable configuration of a Product
  * Must belong to exactly one Product
* Do not:
  * Encode inventory, pricing, orders, or visibility logic
  * Import database entities or infrastructure types
* Documentation:
  * Module-level JSDoc describing Product and Variant semantics
  * JSDoc for `ProductSchema` / `Product` and `VariantSchema` / `Variant`

## Acceptance Criteria

* `product.schema.ts` exists in `packages/contracts/src/catalog/`
* `ProductSchema` / `Product` and `VariantSchema` / `Variant` are exported
* Schemas:
  * Use `ProductId` / `VariantId` contracts
  * Reflect ownership and attribute rules from Domain G
* JSDoc is present and consistent with contracts documentation standards
* No imports from applications, infrastructure, or ORM entities

## Dependencies

* CONTRACTS-01 — Catalog identifier contracts
* CONTRACTS-02 — Catalog pricing contracts (if pricing references are included)

## Estimated Effort

60–90 minutes

