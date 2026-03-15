# Task: OPS17-022 — Permitted Mitigations: Write Suppression + Isolation

## Purpose

Define permitted mitigations that reduce risk without changing semantics (Domain AH; aligns with fail-closed).

## Implementation Notes

During incidents responders may:
- restrict/disable non-critical capabilities
- suppress write paths to protect invariants
- isolate affected components or tenants

Responders must not:
- bypass authorization
- mutate tenant business data directly
- introduce undocumented behavior

## Acceptance Criteria

- Mitigation menu is explicit.
- All mitigations are reversible and governed if retained.
