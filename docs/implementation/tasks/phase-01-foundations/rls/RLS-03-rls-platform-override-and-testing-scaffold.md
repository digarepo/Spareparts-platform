# Task: RLS-03 — Implement platform override and RLS testing scaffold
Blueprints: Domain B (Data & Environment Enforcement), Domain A (Repository & Package Architecture)
Phase: 01 Foundations

## Layer

rls

## Package / Area

packages/db/rls

## Purpose

Provide a controlled platform-level override for supervisory read access and
establish a testing scaffold to verify RLS behavior across tenants.

## Implementation Location

* PostgreSQL schema (migrations or SQL files under `packages/db/rls`)
* Tests under an appropriate test directory (e.g. `packages/db/tests/rls/`)

## Implementation Notes

* Platform override:
  * Define optional read-only policies that allow platform-level supervision
    under a clearly distinguished role or session variable
  * Ensure platform override cannot mutate tenant data
* Testing scaffold:
  * Seed or prepare data for at least two tenants
  * Add tests or scripts that:
    * Assert tenant-scoped queries cannot see other tenants' data
    * Assert platform override can see cross-tenant data read-only, if implemented
* Do not weaken tenant isolation semantics for normal roles.

## Acceptance Criteria

* Optional platform-level read-only RLS policies exist (if required by governance)
* Automated or scripted tests can be run to verify:
  * Tenant isolation
  * Platform override behavior (if present)
* RLS configuration remains aligned with blueprint rules (no hidden backdoors)

## Dependencies

* RLS-01 — Enable RLS on core catalog and inventory tables
* RLS-02 — Implement tenant isolation policies

## Estimated Effort

60–90 minutes

