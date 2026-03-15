# Task: ADMINUI10-052 — Tenant Governance Actions (Platform-scope)

## Purpose

Provide platform-scope governance actions on a tenant without performing tenant business operations.

## Implementation Notes

- Add governance actions to `/tenants/:tenantId`:
  - suspend tenant
  - reinstate tenant
- All actions must:
  - be permission-gated (fail-closed)
  - use the standard `GovernanceActionDialog`
  - show scope-of-effect explicitly (tenant id, resulting status)
  - surface correlation/audit reference
- Never include actions that mutate tenant business state (catalog/orders/payments).

## Acceptance Criteria

- Authorized users can suspend/reinstate with explicit confirmation.
- Unauthorized users cannot see or execute these actions.
- Outcome shows an audit/correlation reference.
