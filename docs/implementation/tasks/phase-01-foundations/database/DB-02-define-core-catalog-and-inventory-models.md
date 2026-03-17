# Task: DB-02 — Define core catalog and inventory models
Blueprints: Domain G (Product Catalog Core), Domain K (Inventory Core Model)
Phase: 01 Foundations

## Layer

database

## Package / Area

packages/db/prisma

## Purpose

Define the core Prisma models for Tenant, Product, Variant, Price, and Inventory
in a way that reflects catalog and inventory semantics from the blueprints.

## Implementation Location

packages/db/prisma/schema.prisma

## Implementation Notes

* Extend `schema.prisma` to include models for:
  * `Tenant`
  * `Product`
  * `Variant`
  * `Price`
  * `Inventory`
* Models must respect blueprint rules:
  * Each Product, Variant, Price, and Inventory record is owned by exactly one Tenant
  * Product identity is distinct from Variant, Price, and Inventory
  * Inventory represents operational stock, not product meaning or pricing
* Keep model fields focused on core identity and relations; avoid adding
  availability, reservation, or order-related fields in this task.

## Acceptance Criteria

* `Tenant`, `Product`, `Variant`, `Price`, and `Inventory` models are defined in `schema.prisma`
* Models compile successfully (`prisma validate`)
* Ownership and separation of concerns match the catalog and inventory blueprints

## Dependencies

* DB-01 — Initialize Prisma schema and datasource

## Estimated Effort

45–60 minutes

