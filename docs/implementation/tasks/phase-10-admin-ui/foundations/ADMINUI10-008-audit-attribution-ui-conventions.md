# Task: ADMINUI10-008 — Audit Attribution UI Conventions

## Purpose

Standardize how the admin UI displays audit attribution and action traceability (Domain Y).

## Implementation Notes

- Define UI conventions:
  - show actor identity on audit events
  - show correlation id / request id where available
  - show intent vs outcome when present
  - show timestamps in consistent format
- For governance actions triggered from UI:
  - display a "Recorded in audit log" confirmation with reference

## Acceptance Criteria

- Audit pages consistently show attribution fields.
- Governance actions show an audit reference when available.
