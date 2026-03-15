# Task: ADMINUI10-002 — Auth Consumption + Permission Model (Client)

## Purpose

Consume backend authN/authZ for platform staff and enforce platform-admin UI gating without re-implementing backend logic.

## Implementation Notes

- Define a client-side auth facade in `apps/platform-admin/app/lib/auth/*`:
  - current user identity (whoami)
  - role/permission set
  - auth state: loading/authenticated/unauthenticated
- Implement a permission evaluation helper:
  - `can(view|act, resource)` style primitives
  - must be explicit and fail-closed (unknown => deny)
- Add route-level guard utilities:
  - redirect to login (or show unauthenticated screen) when required
  - show forbidden screen when authenticated but unauthorized

## Acceptance Criteria

- Navigation and actions are gated by permissions.
- Deep-linking to a forbidden page shows a forbidden state (not partial content).
- Unknown/failed auth resolution fails closed (no privileged UI leaks).
