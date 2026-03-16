# Task: SEC13-020 — Cross-Tenant IDORs + Leakage Regression

## Purpose

Prove tenant isolation as a security invariant (Domain AC) by adding explicit regression checks for cross-tenant access.

## Implementation Notes

- Add a focused regression suite that attempts:
  - cross-tenant resource reads by ID
  - cross-tenant list filtering bypass
  - cross-scope access (platform/tenant/customer)
- Ensure failures:
  - do not reveal existence of protected resources
  - remain explicit and scoped

## Acceptance Criteria

- Cross-tenant access attempts are denied.
- Responses do not leak existence of protected resources.
