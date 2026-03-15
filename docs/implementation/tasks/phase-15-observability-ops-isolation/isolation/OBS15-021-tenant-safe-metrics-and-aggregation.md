# Task: OBS15-021 — Tenant-safe Metrics + Aggregation

## Purpose

Prevent metrics aggregation from enabling reverse inference across tenants (Domain AE).

## Implementation Notes

- Define metric labels:
  - avoid high-cardinality user PII
  - avoid labels that can infer other tenants
- Ensure tenant-facing metrics are:
  - tenant-scoped only
  - coarse enough to avoid reverse inference

## Acceptance Criteria

- Metrics labels are reviewed for leakage risk.
- Tenant dashboards cannot infer other tenants’ activity via metrics.
