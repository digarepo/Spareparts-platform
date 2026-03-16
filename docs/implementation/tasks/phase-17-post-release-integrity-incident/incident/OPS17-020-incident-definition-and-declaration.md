# Task: OPS17-020 — Incident Definition + Declaration

## Purpose

Define incidents by risk to invariants, isolation, semantics, or trust and create an explicit declaration process (Domain AH).

## Implementation Notes

- Incident definition must include:
  - potential invariant violation
  - tenant isolation compromise risk
  - semantic drift from approved behavior
  - continued operation risks correctness/trust
- Define a declaration template:
  - timestamp
  - declared by (authority)
  - confirmed facts vs hypotheses
  - impacted scope/tenants

## Acceptance Criteria

- Incident declaration is explicit and reconstructable.
- Incidents are not defined solely by uptime/KPIs.
