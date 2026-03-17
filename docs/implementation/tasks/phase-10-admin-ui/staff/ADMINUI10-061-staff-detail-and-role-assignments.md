# Task: ADMINUI10-061 — Staff Detail + Role Assignments

## Purpose

Provide staff detail and role assignment governance actions with full auditability.

## Implementation Notes

- Add route module `/staff/:staffId`.
- Show staff profile summary and access history (if available).
- Implement role assignment actions:
  - add/remove role
  - must use `GovernanceActionDialog`
  - must display audit reference/correlation id on completion
- Fail-closed if permissions unknown.

## Acceptance Criteria

- Role changes require explicit confirmation.
- Results are reflected in UI and show audit/correlation reference.
