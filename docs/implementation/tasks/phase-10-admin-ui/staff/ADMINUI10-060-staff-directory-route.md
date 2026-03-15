# Task: ADMINUI10-060 — Platform Staff Directory Route

## Purpose

Allow authorized platform admins to view platform staff accounts and access posture.

## Implementation Notes

- Add route module `/staff`.
- Render staff table with:
  - name/email (as permitted)
  - role(s)
  - status
  - last login (if available)
- Provide filters:
  - role
  - status

## Acceptance Criteria

- Staff list renders and is permission-gated.
- Sensitive fields are not shown to roles without permission.
