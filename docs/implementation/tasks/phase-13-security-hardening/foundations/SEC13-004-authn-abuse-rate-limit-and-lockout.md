# Task: SEC13-004 — AuthN Abuse: Rate Limits + Lockout

## Purpose

Add protective controls to authentication entry points without altering authentication meaning (Domain E).

## Implementation Notes

- Add rate limiting and brute-force controls:
  - per IP, per account identifier, per device fingerprint (if used)
- Lockout must:
  - be explicit and observable
  - not reveal which step failed
  - not become authorization

## Acceptance Criteria

- Auth endpoints resist brute force.
- Failure responses remain non-informative.
