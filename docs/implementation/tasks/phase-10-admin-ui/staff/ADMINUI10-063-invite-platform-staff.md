# Task: ADMINUI10-063 — Invite Platform Staff

## Purpose

Enable authorized platform admins to invite new platform staff.

## Implementation Notes

- Add an "Invite staff" action to `/staff`.
- Invitation workflow must:
  - be permission-gated
  - validate inputs (email, roles)
  - be explicit and confirmable
  - surface outcome + audit/correlation reference
- Ensure the UI does not leak whether an email exists if backend treats it as sensitive.

## Acceptance Criteria

- Authorized users can invite staff.
- UI shows a safe success/failure outcome.
- Audit/correlation reference is shown.
