# Phase 11 — Tenant Dashboard (Seller UI)

This phase implements the Tenant Dashboard UI in `apps/merchant-dashboard`.

## Principles (authoritative)

- Tenant-only authority and isolation (no platform governance; no cross-tenant access).
- All actions execute under exactly one explicit tenant context.
- Permission-gated UI (deny-by-default).
- Mutations are auditable; no mutation may occur if audit capture fails.
- Under failure/uncertainty, degrade capability (often to read-only) without fabricating data.

## MVP-complete (definition for this phase)

After completing Phase 11 tasks, the Tenant Dashboard should be considered MVP-complete if:

- A consistent tenant dashboard shell exists (header/sidebar/content) with explicit tenant context indicator.
- Auth is consumed from the backend and all navigation/routes/actions are permission-gated.
- Core tenant operational surfaces exist:
  - Dashboard overview
  - Catalog/products
  - Inventory
  - Orders (tenant portion)
  - Fulfillment visibility
  - Payments outcomes (tenant-observable)
  - Tenant staff & access
  - Tenant settings
  - Tenant audit log
- All mutating actions are explicit, confirmable where risky, and show audit/correlation references.
- Failure semantics are fail-closed with explicit degraded states.

## Task numbering convention

Files in this phase use IDs of the form `TENANTUI11-###`.
