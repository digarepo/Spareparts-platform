# Task: TENANTUI11-035 — Degraded Banner + Staleness Indicators

## Purpose

Expose partial/unavailable/stale states explicitly and suppress writes under uncertainty.

## Implementation Notes

- Implement `DegradedDataBanner`:
  - reason
  - last successful timestamp
- Ensure feature pages can embed the banner.

## Acceptance Criteria

- Degraded states are explicit.
- Mutation controls are suppressed when required by degraded mode.
