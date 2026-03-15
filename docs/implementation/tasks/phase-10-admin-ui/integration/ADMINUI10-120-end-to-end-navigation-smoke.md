# Task: ADMINUI10-120 — End-to-end Navigation Smoke

## Purpose

Verify that major routes and navigation behave correctly across permission sets.

## Implementation Notes

- Define at least three permission profiles (mocked or real):
  - observer
  - governance admin
  - compliance/audit
- Verify:
  - sidebar shows correct items
  - forbidden routes show forbidden state
  - dashboard widgets load

## Acceptance Criteria

- No runtime routing errors.
- Gating works for all profiles.
