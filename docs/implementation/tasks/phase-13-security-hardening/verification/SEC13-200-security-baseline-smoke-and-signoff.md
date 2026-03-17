# Task: SEC13-200 — Security Baseline Smoke + Sign-off

## Purpose

Provide a minimal, repeatable security baseline verification that can block release (Domain AF no-go alignment).

## Implementation Notes

- Validate:
  - secure headers present
  - auth endpoints protected against brute force
  - tenant isolation regression suite passes
  - abuse controls configured
- Produce an auditable sign-off record.

## Acceptance Criteria

- Baseline checks are runnable and repeatable.
- Sign-off record exists per environment.
