# Task: TENANTUI11-005 — Contract Validation Boundary (Zod)

## Purpose

Validate API responses at the tenant dashboard boundary using shared contracts to prevent rendering unsafe/unknown shapes.

## Implementation Notes

- Introduce contract validation helpers in `apps/merchant-dashboard/app/lib/contracts/*`.
- For each API response used by the tenant dashboard:
  - validate using Zod schemas from `packages/contracts` (or seller-specific view schemas if needed)
  - on validation failure: surface a safe degraded state and suppress mutation capability

## Acceptance Criteria

- Critical pages render only validated data.
- Validation failures produce explicit degraded UI.
