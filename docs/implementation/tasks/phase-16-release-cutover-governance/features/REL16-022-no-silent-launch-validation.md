# Task: REL16-022 — No Silent Launch Validation

## Purpose

Enforce the "no silent launch" rule (Domain AF) by validating exposure changes explicitly.

## Implementation Notes

- Add a release-time validation step:
  - detect route/API exposure changes
  - require explicit acknowledgement in release record
- Ensure exposure cannot occur due to:
  - config drift
  - dependency side effects
  - environment differences

## Acceptance Criteria

- Exposure changes are detectable and reviewed.
- Release record explicitly captures exposure decisions.
