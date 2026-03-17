# Task: TENANTUI11-200 — Navigation + Permissions Smoke

## Purpose

Verify tenant dashboard routing and permission gating across representative tenant roles.

## Implementation Notes

- Define at least three permission profiles (mocked or real):
  - viewer (read-only)
  - operator (catalog/inventory/orders)
  - tenant admin (staff/settings)
- Verify:
  - sidebar shows correct items per profile
  - forbidden routes show forbidden state
  - tenant context indicator is correct

## Acceptance Criteria

- No runtime routing errors.
- Gating works for all profiles.
