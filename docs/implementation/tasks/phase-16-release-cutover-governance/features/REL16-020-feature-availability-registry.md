# Task: REL16-020 — Feature Availability Registry

## Purpose

Implement an explicit registry of feature availability states (Domain AF).

## Implementation Notes

- Every feature must be explicitly one of:
  - Enabled
  - Disabled
  - Not present
- Availability must:
  - be documented
  - not be inferred
  - not depend on environment
- Maintain a single inventory including:
  - backend features (endpoints/capabilities)
  - UI routes/features (admin, merchant-dashboard, storefront)

## Acceptance Criteria

- Registry exists and is versioned.
- No feature is implicitly enabled.
