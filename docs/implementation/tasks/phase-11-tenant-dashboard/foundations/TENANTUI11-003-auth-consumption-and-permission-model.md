# Task: TENANTUI11-003 — Auth Consumption + Permission Model (Tenant)

## Purpose

Consume backend authN/authZ for tenant staff and gate tenant dashboard UI by explicit permissions (deny-by-default).

## Implementation Notes

- Implement an auth facade in `apps/merchant-dashboard/app/lib/auth/*`:
  - current identity
  - permission set in active tenant scope
  - auth state: loading/authenticated/unauthenticated
- Implement permission helpers (fail-closed):
  - `can(action, resource)`
- Ensure permissions are tenant-scoped and cannot be used outside tenant context.

## Acceptance Criteria

- Navigation/routes/actions are permission-gated.
- Deep-link forbidden routes show forbidden state.
