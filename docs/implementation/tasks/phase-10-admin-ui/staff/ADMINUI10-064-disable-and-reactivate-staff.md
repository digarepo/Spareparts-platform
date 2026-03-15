# Task: ADMINUI10-064 — Disable / Reactivate Staff Account

## Purpose

Provide governance actions to disable or reactivate a platform staff account.

## Implementation Notes

- Add actions on `/staff/:staffId`:
  - disable account
  - reactivate account
- Must:
  - require explicit confirmation
  - show scope-of-effect
  - surface audit/correlation reference

## Acceptance Criteria

- Actions are permission-gated and fail-closed.
- Outcomes are clearly shown and audit-linked.
