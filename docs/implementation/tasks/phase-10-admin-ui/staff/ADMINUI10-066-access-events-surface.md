# Task: ADMINUI10-066 — Staff Access Events Surface

## Purpose

Expose staff access events to support compliance and incident response.

## Implementation Notes

- Add an "Access Events" section/tab on `/staff/:staffId`.
- Display recent:
  - login events
  - session creation/revocation events
  - MFA changes (if available)
- Link entries to audit detail where applicable.

## Acceptance Criteria

- Access events render with safe pagination and filters.
- Entries link to audit events when available.
