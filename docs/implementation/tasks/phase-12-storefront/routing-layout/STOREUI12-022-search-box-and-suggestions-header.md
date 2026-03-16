# Task: STOREUI12-022 — Header Search Box + Suggestions

## Purpose

Provide a fast discovery entry point with suggestions while respecting Search non-authority rules.

## Implementation Notes

- Implement a header search box:
  - debounced suggestions
  - keyboard navigation
- Suggestions must be:
  - clearly non-authoritative
  - safe under search failure (fall back to normal navigation)

## Acceptance Criteria

- Search box works with keyboard.
- Search outages do not break header rendering.
