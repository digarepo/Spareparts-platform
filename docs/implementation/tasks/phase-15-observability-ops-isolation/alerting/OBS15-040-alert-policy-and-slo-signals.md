# Task: OBS15-040 — Alert Policy + SLO Signals (Humans Only)

## Purpose

Create alerting rules as human signals without automated remediation or privilege escalation (Domain AE).

## Implementation Notes

- Define alert classes:
  - correctness-risk alerts (invariant enforcement failures)
  - isolation-risk alerts (suspected leakage)
  - availability/performance alerts
- Ensure alerts:
  - do not trigger automated state changes
  - do not bypass governance

## Acceptance Criteria

- Alerts are actionable and bounded.
- No automated remediation hooks exist.
