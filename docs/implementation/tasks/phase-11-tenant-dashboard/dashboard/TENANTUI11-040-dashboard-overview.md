# Task: TENANTUI11-040 — Dashboard Overview

## Purpose

Provide a tenant-scoped overview answering: "How is my business doing right now?" without cross-tenant comparisons.

## Implementation Notes

- Add route module `/dashboard`.
- Widgets (tenant-scoped):
  - orders summary (open/paid/shipped)
  - revenue summary (tenant-visible only)
  - inventory alerts (low stock)
  - fulfillment status summary
  - payment outcomes (success/failure rate)
- Use loader prefetch for primary widgets.

## Acceptance Criteria

- `/dashboard` renders inside tenant shell.
- Widgets show explicit loading/empty/error/degraded states.
