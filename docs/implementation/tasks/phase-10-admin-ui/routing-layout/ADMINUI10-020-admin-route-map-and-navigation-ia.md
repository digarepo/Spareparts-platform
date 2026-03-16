# Task: ADMINUI10-020 — Admin Route Map + Navigation IA

## Purpose

Define the authoritative route inventory and navigation structure for the platform-admin SPA.

## Implementation Notes

- Create a route map covering:
  - `/` (redirect to dashboard)
  - `/dashboard`
  - `/tenants`, `/tenants/:tenantId`
  - `/staff`, `/staff/:staffId`, `/roles`
  - `/policies`
  - `/search-governance`
  - `/payments`
  - `/audit`, `/audit/:eventId`
  - `/system/health`

- Define feature inventory per route:
  - `/staff`: invite/disable/revoke access actions (permission-gated)
  - `/tenants/:tenantId`: governance actions (suspend/reinstate, flags)
  - `/policies`: history + diff view
  - `/audit`: saved views + export
- Group nav into sections:
  - Overview
  - Governance
  - Observability
  - Security & Access
- Navigation items must be permission-filtered.

## Acceptance Criteria

- A single source-of-truth route inventory exists for Phase 10.
- Navigation grouping matches the route inventory.
