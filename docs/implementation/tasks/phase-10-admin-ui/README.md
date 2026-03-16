# Phase 10 — Platform Admin UI

This phase implements the Platform Admin UI (apps/platform-admin) as a React Router v7 SPA.

## Principles (authoritative)

- Platform-scope only (no tenant operations).
- Read-only by default.
- Governance actions are explicit, permission-gated, confirmable, and fully auditable.
- Fail-closed behavior under uncertainty or degraded dependencies.

## MVP-complete (definition for this phase)

After completing Phase 10 tasks, the Platform Admin UI should be considered MVP-complete if:

- All routes in the Phase 10 route inventory exist and render inside a consistent admin shell.
- Auth is consumed from the backend and UI is permission-gated (navigation + routes + actions).
- Read-only by default is upheld across all pages.
- Governance actions (where supported by the backend) are explicit, confirmable, and surface an audit/correlation reference.
- Failures are explicit (unauthenticated/forbidden/degraded) and fail-closed.

## Expected output (high-level)

- Admin application shell (layout + navigation + routing)
- Auth consumption + permission-based gating (no backend auth re-implementation)
- Data layer: TanStack Query for caching; React Router loaders for route-level prefetch where appropriate
- Page modules:
  - Dashboard
  - Tenants (read-only)
  - Staff & access (platform staff / roles / lifecycle)
  - Policies (governance + history/diff)
  - Search governance (platform)
  - Payments observability (privacy-safe)
  - Audit explorer (saved views + export)
  - System health

## Hierarchical implementation order

Implement top-down to avoid rework:

1. Foundations: SPA mode, auth consumption, API client, contracts, TanStack Query.
2. Global UX: error/degraded states + audit attribution conventions.
3. App shell: route inventory, guards, layout, sidebar, header.
4. Shared components: page shell, tables, filter bar, governance action dialog.
5. Routes (leaf features): dashboard, tenants, staff, policies, search governance, payments, audit, system health.
6. Integration checks / smoke tests.

## Task numbering convention

Files in this phase use IDs of the form `ADMINUI10-###`.
