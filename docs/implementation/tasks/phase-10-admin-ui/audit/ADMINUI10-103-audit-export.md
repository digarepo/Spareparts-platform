# Task: ADMINUI10-103 — Audit Export

## Purpose

Allow authorized users to export audit query results for compliance workflows.

## Implementation Notes

- Add an export action to `/audit`:
  - exports current filtered result set
  - requires explicit confirmation (and may be permission-gated separately)
- Ensure exports:
  - are bounded (time range required)
  - are auditable (export itself is an auditable action)
  - redact sensitive fields according to permission

## Acceptance Criteria

- Export is permission-gated and bounded.
- Export action produces an auditable record.
