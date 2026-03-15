# Task: ADMINUI10-122 — Privacy Regression Checks (Payments)

## Purpose

Prevent accidental exposure of sensitive payment/customer data in platform-admin UI.

## Implementation Notes

- Add a checklist for payments UI:
  - no PAN-like fields
  - no raw payment method details
  - no customer email/address unless explicitly permitted and marked admin-safe
  - event-level surfaces are permission-gated
  - redaction is default

## Acceptance Criteria

- Payments pages pass the checklist.
- Unauthorized roles cannot access Tier B/C views.
