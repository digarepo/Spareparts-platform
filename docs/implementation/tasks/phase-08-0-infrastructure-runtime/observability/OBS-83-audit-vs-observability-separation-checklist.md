# Task: OBS-83 — Audit vs observability separation checklist
Blueprint: Domain AE (audit vs observability boundary)
Phase: 08 Infrastructure & Runtime

## Layer

observability

## Package / Area

docs/ops

## Purpose

Create an operator/developer checklist to prevent accidentally treating telemetry as audit truth.

## Implementation Location

* docs/ops/audit-vs-observability-checklist.md

## Implementation Notes

* Checklist must include:
  * audits are authoritative
  * telemetry failures must not change outcomes
  * sensitive actions require immutable audit records

## Acceptance Criteria

* Checklist exists and is referenced by PR template / contributor guidance if present.

## Dependencies

* Domain AE

## Estimated Effort

30–60 minutes
