# Task: ADMINUI10-090 — Payments Observability Route (Privacy-safe)

## Purpose

Provide platform-scope payments observability without exposing sensitive payment details.

## Implementation Notes

- Add route module `/payments`.
- Implement three visibility tiers (permission-based):
  - Tier A: aggregated metrics (default)
  - Tier B: recent events list (restricted)
  - Tier C: event drilldown (most restricted)
- Prohibit:
  - displaying raw payment method data
  - displaying customer PII unless explicitly provided as admin-safe envelope by backend
- Use redaction by default (hash/reference ids) when showing event-level data.

## Acceptance Criteria

- Payments page renders with privacy-safe defaults.
- Elevated access reveals more detail but remains non-PII.
- No mutation actions exist.
