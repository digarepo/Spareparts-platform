# Task: ADMINUI10-071 — Policy History + Audit Links

## Purpose

Make policy changes explainable and attributable by exposing change history and linking to audit events.

## Implementation Notes

- On `/policies`, add a history panel for a selected policy:
  - list recent updates
  - show actor + timestamp
  - link to `/audit/:eventId`
- If backend provides version ids, show version identifiers.

## Acceptance Criteria

- Policy history is visible to authorized users.
- Each change links to an audit record.
