# Task: TEST14-080 — Search Load Smoke

## Purpose

Run a bounded load smoke on search endpoints to detect resource exhaustion risk.

## Implementation Notes

- Focus on:
  - p95 latency
  - error rates
  - tenant fairness (no tenant can starve others)
- Keep the test bounded and repeatable.

## Acceptance Criteria

- Baseline performance numbers are recorded.
- Regressions can be detected.
