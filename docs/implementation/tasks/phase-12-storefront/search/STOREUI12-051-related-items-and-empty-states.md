# Task: STOREUI12-051 — Related Items + Empty States

## Purpose

Improve discovery by showing related items and safe empty states.

## Implementation Notes

- Add "Related items" module:
  - on search empty results
  - optionally on PDP
- Related items must:
  - respect visibility rules
  - never imply availability guarantees

## Acceptance Criteria

- Empty results show helpful alternatives.
- Related items render without breaking when search is degraded.
