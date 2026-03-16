# Task: TENANTUI11-033 — Form Patterns + Validation

## Purpose

Standardize safe forms for tenant mutations (products, inventory adjustments, order actions, staff invites).

## Implementation Notes

- Define a form pattern:
  - client validation (Zod)
  - submit disables during in-flight
  - errors are explicit and non-ambiguous
- Ensure forms never infer defaults that expand authority.

## Acceptance Criteria

- New forms follow a consistent UX.
- Validation errors are displayed clearly.
