# Task: ADMINUI10-065 — Revoke Sessions / Reset MFA (If Supported)

## Purpose

Allow incident response actions for platform staff access posture.

## Implementation Notes

- On `/staff/:staffId`, add actions (only if backend supports):
  - revoke active sessions
  - reset MFA / require re-enrollment
- These are high-sensitivity governance actions:
  - typed confirmation
  - audit/correlation reference displayed
  - strict permission gating

## Acceptance Criteria

- If endpoints exist, actions are available and auditable.
- If endpoints do not exist, UI clearly omits the actions (no dead buttons).
