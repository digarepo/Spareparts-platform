# Task: RLS-20 — Enable RLS on taxonomy tables
Blueprint: Domain B (Data & Environment Enforcement)
Phase: 02 Catalog

## Layer

rls

## Package / Area

packages/db/rls

## Purpose

Enable PostgreSQL Row-Level Security on taxonomy and classification tables as a
prerequisite for tenant isolation and governance policies.

## Implementation Location

PostgreSQL schema (migrations or SQL files under `packages/db/rls`)

## Implementation Notes

* Enable RLS on:
  * Taxonomy table
  * Product↔Taxonomy join table (classification assignment)
  * Any taxonomy history tables (if present in this phase)
* Use `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`.

## Acceptance Criteria

* RLS is enabled for taxonomy and classification tables
* Verification via `pg_catalog` views confirms RLS is ON

## Dependencies

* DB-22 — Add taxonomy models and relations
* DB-23 — Catalog Phase 2 migration applied (taxonomy tables exist)

## Estimated Effort

15–30 minutes

