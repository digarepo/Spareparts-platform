# Task: RECOVERY-81 — Incident runbook: fail-closed + degradation rules
Blueprint: Domain AC (fail closed), Domain AD (failure correctness)
Phase: 08 Infrastructure & Runtime

## Layer

recovery

## Package / Area

docs/ops

## Purpose

Create an incident runbook describing how to degrade safely under dependency failures or active abuse without breaking invariants.

## Implementation Location

* docs/ops/incident-runbook.md

## Implementation Notes

* Must include:
  * dependency outage playbooks (DB, Redis)
  * rate limiting escalation
  * disabling non-essential surfaces
  * audit preservation

## Acceptance Criteria

* Runbook exists and aligns with fail-closed semantics.

## Dependencies

* Domain AC
* Domain AD

## Estimated Effort

60–120 minutes
