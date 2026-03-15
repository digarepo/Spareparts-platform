# Task: TENANTUI11-001 — Configure Tenant Dashboard as SPA

## Purpose

Ensure `apps/merchant-dashboard` runs as an SPA (no SSR), consistent with the frontend being a pure API consumer.

## Implementation Notes

- Disable SSR in React Router config for `apps/merchant-dashboard`.
- Verify dev/build scripts still function.
- Ensure deep-link refresh works for all tenant routes.

## Acceptance Criteria

- App runs in dev as SPA.
- Refreshing a deep link route loads correctly.
