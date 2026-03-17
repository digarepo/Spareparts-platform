# Task: STOREUI12-009 — Global Error + Degraded States

## Purpose

Implement explicit degraded semantics:
- search outages degrade discovery
- checkout should not be blocked by search outages
- no fabricated data

## Implementation Notes

- Add shared UI states:
  - `AppErrorState`
  - `NotFoundState`
  - `DegradedBanner`
- Ensure search failure fallback allows category browsing.

## Acceptance Criteria

- Search outages do not block cart/checkout.
- Degraded states are explicit.
