# Task: ADMINUI10-034 — Degraded Banner + Staleness Indicators

## Purpose

Expose "partial/unavailable/stale" states explicitly (Domain Y).

## Implementation Notes

- Implement a `DegradedDataBanner`:
  - shows reason (timeout, validation failure, dependency down)
  - shows last successful timestamp (if available)
- Integrate into page shells.

## Acceptance Criteria

- Pages show explicit degraded banners when needed.
- No silent fallback behavior.
