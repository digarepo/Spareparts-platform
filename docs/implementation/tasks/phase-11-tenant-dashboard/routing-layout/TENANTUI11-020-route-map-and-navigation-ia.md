# Task: TENANTUI11-020 — Route Map + Navigation IA (Tenant Dashboard)

## Purpose

Define the authoritative route inventory and navigation structure for the tenant dashboard.

## Implementation Notes

- Create a route map covering:
  - `/` (redirect to dashboard)
  - `/dashboard`
  - `/products`, `/products/:productId`
  - `/inventory`
  - `/orders`, `/orders/:orderId`
  - `/fulfillment`, `/fulfillment/:fulfillmentId`
  - `/payments`
  - `/staff`, `/staff/:staffId`, `/roles`
  - `/settings`
  - `/audit`, `/audit/:eventId`
- Navigation must be permission-filtered (deny-by-default).
- Group nav into:
  - Overview
  - Operations
  - Financial
  - Security & Access
  - Settings

## Acceptance Criteria

- A single source-of-truth route inventory exists.
- Navigation grouping matches the route inventory.
