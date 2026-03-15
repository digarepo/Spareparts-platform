# Task: STOREUI12-204 — Search Degradation + Category Fallback Smoke

## Purpose

Validate search failure semantics (Domain T): degrade visibility, not operations.

## Implementation Notes

- Simulate search service outage.
- Verify:
  - search route shows degraded discovery state
  - category browsing remains available
  - cart/checkout remains usable

## Acceptance Criteria

- Search outage does not block purchase flows.
- Category browsing provides fallback discovery.
