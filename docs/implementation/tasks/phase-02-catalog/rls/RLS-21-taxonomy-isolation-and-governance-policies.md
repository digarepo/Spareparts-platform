# Task: RLS-21 — Taxonomy isolation and governance policies
Blueprints: Domain B (Data & Environment Enforcement), Domain I (Taxonomy Classification)
Phase: 02 Catalog

## Layer

rls

## Package / Area

packages/db/rls

## Purpose

Define RLS policies for taxonomy and classification tables that preserve tenant
isolation while supporting platform-governed taxonomy, ensuring there are no
implicit cross-tenant reads or writes.

## Implementation Location

PostgreSQL schema (migrations or SQL files under `packages/db/rls`)

## Implementation Notes

* Define policies for:
  * Taxonomy table
  * Product↔Taxonomy join table
  * Taxonomy assignment history table
* Policy goals:
  * Tenants may only see and mutate tenant-scoped classification records
    when allowed
  * Platform operators may have supervisory access where explicitly intended
  * Default behavior is fail-closed when tenant context is missing
* Avoid:
  * “Global” policies that grant broad access without explicit scope checks
  * Bypassing tenant session variables used by the application for RLS

## Acceptance Criteria

* Policies exist that enforce tenant isolation for taxonomy assignment data
* Cross-tenant access is blocked by the database for tenant-scoped roles
* Platform governance access is explicit and cannot mutate tenant-owned records

## Dependencies

* RLS-20 — Enable RLS on taxonomy tables
* API-01 (Phase 01) — Tenant context pipeline sets DB tenant context

## Estimated Effort

45–75 minutes

