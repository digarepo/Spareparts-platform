# Task: SEC13-021 — Aggregation + Timing Inference Guardrails

## Purpose

Reduce cross-tenant inference risk via aggregates, timing, and error shape differences.

## Implementation Notes

- Review endpoints returning aggregates:
  - ensure tenant-scoped aggregates can’t be combined to infer other tenants
- Standardize error shapes and response times where feasible.
- Ensure rate limits preserve tenant fairness.

## Acceptance Criteria

- Aggregates cannot be used for cross-tenant inference.
- Error responses are consistent and non-revealing.
