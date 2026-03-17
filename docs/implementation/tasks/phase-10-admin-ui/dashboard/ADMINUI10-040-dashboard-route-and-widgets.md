# Task: ADMINUI10-040 — Dashboard Route + Widget Grid

## Purpose

Create the platform admin dashboard as the default landing surface for platform observability.

## Implementation Notes

- Add route module `/dashboard`.
- Dashboard should be read-only.
- Include widgets:
  - Platform health summary
  - Tenant status counts (active/suspended)
  - Recent incidents / degraded dependencies banner
  - Payments reliability summary (aggregated)
  - Search health summary
- Use TanStack Query hooks for each widget.
- Use route loader to prefetch primary dashboard queries.

## Acceptance Criteria

- `/dashboard` renders inside admin shell.
- Widgets render with loading/empty/error states.
- No tenant mutation actions exist.
