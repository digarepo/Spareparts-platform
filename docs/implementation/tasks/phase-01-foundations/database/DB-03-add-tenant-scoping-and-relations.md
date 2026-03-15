# Task: DB-03 — Add tenant scoping and core relations
Blueprints: Domain B (Data & Environment Enforcement), Domain G (Product Catalog Core), Domain K (Inventory Core Model)
Phase: 01 Foundations

## Layer

database

## Package / Area

packages/db/prisma

## Purpose

Add tenant-scoping fields and relational links between Tenant, Product, Variant,
Price, and Inventory to enforce ownership and identity rules at the data model level.

## Implementation Location

packages/db/prisma/schema.prisma

## Implementation Notes

* Ensure each tenant-owned model has a tenant-scoping field and relation:
  * `Product` → `Tenant`
  * `Variant` → `Product` (and thus Tenant via Product)
  * `Price` → `Variant`
  * `Inventory` → `Variant`
* Add appropriate foreign keys and relation fields so the model:
  * Reflects “Product may have zero or more Variants”
  * Ensures Variants cannot exist without a Product
  * Links Price and Inventory records to specific Variants
* Do not introduce cross-tenant relations or global tables that break isolation.

## Acceptance Criteria

* Tenant scoping fields and relations are defined for Product, Variant, Price, and Inventory
* Relations compile successfully and Prisma client can be generated
* Model structure enforces blueprint ownership and identity rules

## Dependencies

* DB-01 — Initialize Prisma schema and datasource
* DB-02 — Define core catalog and inventory models

## Estimated Effort

45–60 minutes

