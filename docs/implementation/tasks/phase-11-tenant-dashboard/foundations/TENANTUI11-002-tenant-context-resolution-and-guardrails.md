# Task: TENANTUI11-002 — Tenant Context Resolution + Guardrails

## Purpose

Ensure all tenant dashboard behavior executes under exactly one explicit tenant context and never escapes tenant scope.

## Implementation Notes

- Add a tenant context resolver in `apps/merchant-dashboard/app/lib/tenant-context/*`.
- Determine how tenant context is established (based on backend contracts), e.g.:
  - from session/claims
  - from a dedicated `whoami` endpoint returning active tenant
- Enforce rules:
  - if tenant context is missing/ambiguous => fail closed
  - no cross-tenant switching inside the Seller UI unless explicitly designed and audited
- Display active tenant context in the shell header.

## Acceptance Criteria

- Active tenant context is required for all routes.
- UI clearly shows which tenant is active.
