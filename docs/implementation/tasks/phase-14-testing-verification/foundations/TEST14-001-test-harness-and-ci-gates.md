# Task: TEST14-001 — Test Harness + CI Gates

## Purpose

Establish a consistent test harness and CI gates that can enforce Domain AF no-go conditions.

## Implementation Notes

- Define tiers:
  - unit (fast)
  - integration (service boundaries)
  - e2e (UI flows)
  - perf smoke (bounded)
- CI rules:
  - all release-blocking suites must pass
  - failures are explicit and stop the pipeline

## Acceptance Criteria

- CI can run the suite deterministically.
- Release blockers are clearly labeled.
