# Task: RLS-01 — Enable RLS on core catalog and inventory tables
Blueprint: Domain B (Data & Environment Enforcement)
Phase: 01 Foundations

## Layer

rls

## Package / Area

packages/db/rls

## Purpose

Enable PostgreSQL Row-Level Security (RLS) on core tenant-owned catalog and
inventory tables as a prerequisite for tenant isolation policies.

## Implementation Location

PostgreSQL schema (migrations or SQL files under `packages/db/rls`)

## Implementation Notes

* Enable RLS on at least:
  * Product table
  * Variant table
  * Price table
  * Inventory table
* Use `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` in migration SQL or
  dedicated RLS SQL scripts.
* Do not define policies in this task; focus solely on enabling RLS.

## Acceptance Criteria

* RLS is enabled for Product, Variant, Price, and Inventory tables
* Verification via `pg_catalog` views or direct inspection confirms RLS is ON

## Dependencies

* DB-02 — Define core catalog and inventory models
* DB-05 — Initial migration applied (or equivalent schema in place)

## Estimated Effort

15–30 minutes

