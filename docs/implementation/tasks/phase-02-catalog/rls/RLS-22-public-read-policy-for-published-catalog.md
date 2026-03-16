# Task: RLS-22 — Public read policy for published catalog
Blueprints: Domain H (Catalog Visibility & Publication), Domain B (Data & Environment Enforcement)
Phase: 02 Catalog

## Layer

rls

## Package / Area

packages/db/rls

## Purpose

Allow controlled public/customer read access to published catalog products while
preserving tenant isolation and preventing accidental exposure of draft or
internal-only products.

## Implementation Location

PostgreSQL schema (migrations or SQL files under `packages/db/rls`)

## Implementation Notes

* Implement a read-only policy that:
  * Allows SELECT on Product (and any necessary related tables) only when:
    * Product is in a published state, and
    * Any additional visibility constraints are satisfied
* Ensure:
  * No INSERT/UPDATE/DELETE permissions are granted to public roles
  * Draft/unpublished products are never visible to public roles
  * Tenant-scoped roles remain tenant-isolated and unaffected
* This policy must be explicit and auditable; avoid “broad allow” rules.

## Acceptance Criteria

* Public/customer role can read published products only
* Draft/unpublished products are not readable by public roles
* No write access is granted by the public policy
* Tenant isolation policies remain intact for tenant-scoped roles

## Dependencies

* DB-20 — Extend Product model for state and slug
* RLS-01/02 (Phase 01) — Core tenant isolation policies
* RLS-21 — Taxonomy isolation and governance policies (if taxonomy is part of public listing)

## Estimated Effort

45–75 minutes

