# Task: TENANTUI11-009 — Audit Attribution UI Conventions (Tenant)

## Purpose

Standardize how the tenant dashboard displays audit attribution and action traceability (Domain AB).

## Implementation Notes

- Define conventions for displaying:
  - actor identity
  - tenant id/context
  - intent vs outcome
  - correlation/request id
- For each mutating action UI:
  - show an "audit receipt" with reference/correlation id

## Acceptance Criteria

- Mutations surface an audit/correlation reference.
- Audit UI uses consistent attribution formatting.
