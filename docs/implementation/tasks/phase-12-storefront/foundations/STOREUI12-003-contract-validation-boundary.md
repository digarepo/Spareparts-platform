# Task: STOREUI12-003 — Contract Validation Boundary (Zod)

## Purpose

Validate API responses at the storefront boundary using authoritative contracts.

## Implementation Notes

- Create `apps/storefront/app/lib/contracts/*` helpers.
- Validate responses with Zod schemas from `packages/contracts` (or storefront-safe view schemas).
- On validation failures:
  - show degraded/error state
  - do not fabricate missing values

## Acceptance Criteria

- Critical routes render only validated data.
- Validation failures are explicit.
