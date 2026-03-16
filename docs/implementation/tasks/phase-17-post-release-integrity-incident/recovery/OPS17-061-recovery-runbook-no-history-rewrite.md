# Task: OPS17-061 — Recovery Runbook (No History Rewrite)

## Purpose

Define recovery steps that restore last known correct state without rewriting history (Domain AD).

## Implementation Notes

- Recovery must not:
  - rewrite orders/payments/inventory/audit history
  - re-execute business actions
  - replay external effects (payments)
- Recovery actions must be:
  - explicitly authorized
  - fully auditable

## Acceptance Criteria

- Recovery runbook exists and is reviewable.
- Steps explicitly prohibit history rewrite.
