# Task: OBS15-200 — Observability Non-Interference Smoke

## Purpose

Prove observability systems are non-interfering (Domain AE).

## Implementation Notes

- Test scenarios:
  - telemetry exporter down
  - log sink unavailable
  - tracing sampling changed
- Verify:
  - business outcomes do not change
  - only visibility is reduced

## Acceptance Criteria

- Failures in observability degrade insight only.
- No request paths change behavior under observability failure.
