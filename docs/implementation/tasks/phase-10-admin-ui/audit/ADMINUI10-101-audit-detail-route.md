# Task: ADMINUI10-101 — Audit Detail Route

## Purpose

Provide a detailed, read-only view of a single audit event.

## Implementation Notes

- Add route module `/audit/:eventId`.
- Display:
  - actor
  - timestamp
  - action intent
  - outcome
  - correlation id
  - related entities (platform-scope references)
- Ensure sensitive fields are redacted unless explicitly permitted.

## Acceptance Criteria

- Audit detail loads reliably and is permission-gated.
- Displays attribution consistently.
