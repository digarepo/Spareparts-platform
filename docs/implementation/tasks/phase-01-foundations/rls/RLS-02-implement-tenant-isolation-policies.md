# Task: RLS-02 — Implement tenant isolation policies
Blueprint: Domain B (Data & Environment Enforcement)
Phase: 01 Foundations

## Layer

rls

## Package / Area

packages/db/rls

## Purpose

Define PostgreSQL Row-Level Security policies that enforce strict tenant isolation
for core catalog and inventory tables.

## Implementation Location

PostgreSQL schema (migrations or SQL files under `packages/db/rls`)

## Implementation Notes

* For each tenant-owned table (Product, Variant, Price, Inventory):
  * Define RLS policies that:
    * Restrict SELECT/UPDATE/DELETE to rows matching the current tenant id
    * Are compatible with how tenant context is set in the Postgres session
* Policies must:
  * Deny access when tenant identity is missing or invalid
  * Not allow cross-tenant reads or writes under any circumstances
* Keep platform supervisory or cross-tenant access for a later, explicit task.

## Acceptance Criteria

* RLS policies exist for Product, Variant, Price, and Inventory tables
* Queries executed with a given tenant context can only see that tenant's rows
* Cross-tenant reads/writes are blocked by the database

## Dependencies

* RLS-01 — Enable RLS on core catalog and inventory tables
* API-01 — Implement tenant context pipeline (to set tenant context in DB session)

## Estimated Effort

45–60 minutes

