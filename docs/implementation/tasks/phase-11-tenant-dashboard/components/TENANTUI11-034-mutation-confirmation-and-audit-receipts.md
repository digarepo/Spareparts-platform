# Task: TENANTUI11-034 — Mutation Confirmation + Audit Receipts

## Purpose

Ensure tenant mutations are explicit, confirmable when risky, and always surface an audit receipt (Domain AB).

## Implementation Notes

- Implement `TenantMutationDialog`:
  - shows scope-of-effect (tenant + entity)
  - shows required permission
  - supports typed confirmation for high-risk actions
  - shows outcome + audit/correlation reference
- Integrate into mutation flows (inventory adjustments, order cancellations, staff role changes).

## Acceptance Criteria

- Risky actions require explicit confirmation.
- Successful/failed attempts show traceable references.
