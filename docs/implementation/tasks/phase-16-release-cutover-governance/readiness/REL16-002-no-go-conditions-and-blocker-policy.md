# Task: REL16-002 — No-Go Conditions + Blocker Policy

## Purpose

Operationalize Domain AF “automatic no-go” conditions.

## Implementation Notes

- Define the authoritative no-go list:
  - invariant violations
  - cross-tenant leakage risks
  - unaudited mutation paths
  - security/isolation exceptions
  - production-only logic/shortcuts
  - features exposed without explicit availability decisions
- Define escalation + resolution workflow.

## Acceptance Criteria

- No-go list is explicit and enforced.
- A release cannot proceed with any no-go condition present.
