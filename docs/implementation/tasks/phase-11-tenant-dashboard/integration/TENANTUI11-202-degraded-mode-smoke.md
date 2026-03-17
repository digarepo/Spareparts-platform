# Task: TENANTUI11-202 — Degraded Mode Smoke

## Purpose

Validate Domain AB degraded semantics: explicit failure, no fabricated data, and write suppression under uncertainty.

## Implementation Notes

- Simulate degraded conditions:
  - API dependency down
  - contract validation failure (mock)
  - tenant context unresolved
- Verify:
  - degraded banners shown
  - mutation controls suppressed
  - no silent fallback behavior

## Acceptance Criteria

- Degraded states are explicit.
- Writes are suppressed under uncertainty.
