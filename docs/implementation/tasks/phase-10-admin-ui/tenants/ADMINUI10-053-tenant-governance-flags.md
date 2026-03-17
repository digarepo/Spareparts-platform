# Task: ADMINUI10-053 — Tenant Governance Flags

## Purpose

Allow platform admins to apply governance/compliance flags to tenants.

## Implementation Notes

- Implement a governance flags section on `/tenants/:tenantId`:
  - add/remove flags (bounded to an allowlist)
  - add optional note/justification (if backend supports)
- Treat flag changes as governance actions:
  - confirmable
  - auditable
  - permission-gated

## Acceptance Criteria

- Flags can be viewed by authorized users.
- Flag changes require explicit confirmation and surface audit/correlation reference.
