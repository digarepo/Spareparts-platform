# Task: REL16-021 — Explicit Defaults + Disabled vs Unavailable

## Purpose

Define explicit defaults for all features/capabilities and the distinction between disabled and unavailable (Domain AF).

## Implementation Notes

- For each feature:
  - define default state
  - document disabled behavior (must not be reachable)
  - document unavailable behavior (must not partially exist)

## Acceptance Criteria

- Defaults are intentional and conservative.
- Disabled features are not accidentally reachable.
