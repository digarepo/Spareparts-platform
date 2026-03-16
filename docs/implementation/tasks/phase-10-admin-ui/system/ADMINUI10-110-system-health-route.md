# Task: ADMINUI10-110 — System Health Route

## Purpose

Expose platform dependency health and operational posture in a read-only manner.

## Implementation Notes

- Add route module `/system/health`.
- Display dependency checks:
  - API
  - database (as reported by API)
  - Redis (as reported)
  - search (Elasticsearch)
  - payments provider health (aggregated)
- Show timestamps and degraded banners.

## Acceptance Criteria

- Health page renders and clearly indicates dependency status.
- Degraded states are explicit.
