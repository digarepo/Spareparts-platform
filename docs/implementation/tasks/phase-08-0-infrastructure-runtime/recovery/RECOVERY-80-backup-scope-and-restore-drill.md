# Task: RECOVERY-80 — Backup scope definition + restore drill
Blueprint: Domain AD (backup/recovery semantics)
Phase: 08 Infrastructure & Runtime

## Layer

recovery

## Package / Area

infrastructure/ops

## Purpose

Define backup scope and run a restore drill plan that preserves audit truth and tenant isolation.

## Implementation Location

* docs/ops/backup-scope.md
* docs/ops/restore-drill.md

## Implementation Notes

* Back up authoritative sources:
  * Postgres (including audit tables)
  * configuration/policy state
* Do not treat Redis as backup truth.
* Restore must not replay external effects.

## Acceptance Criteria

* Backup scope is explicit.
* Restore drill steps exist and include verification checks.

## Dependencies

* Domain AD

## Estimated Effort

60–120 minutes
