# Task: OPS17-060 — Backup Scope + Audit Preservation

## Purpose

Define backup scope semantics and ensure audit records are preserved (Domain AD).

## Implementation Notes

- Backups must include:
  - authoritative data sources
  - configuration/policy state
  - audit records
- Derived data must be rebuilt, not restored.

## Acceptance Criteria

- Backup scope is explicit and governed.
- Audit records survive backup/restore.
