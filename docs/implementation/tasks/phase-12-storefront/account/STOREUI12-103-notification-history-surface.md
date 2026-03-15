# Task: STOREUI12-103 — Notification History Surface (Informational)

## Purpose

Expose customer notification history as informational records (Domain AM).

## Implementation Notes

- Add route module `/account/notifications`.
- Show list of notifications:
  - event type reference
  - channel
  - timestamp
  - immutable message snapshot
- Notifications must not be treated as business state.

## Acceptance Criteria

- Notification history is view-only.
- Entries reference triggering events where applicable.
