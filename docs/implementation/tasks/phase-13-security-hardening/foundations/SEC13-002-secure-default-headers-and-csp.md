# Task: SEC13-002 — Secure Default Headers + CSP

## Purpose

Apply baseline web security headers for all web apps without changing business semantics.

## Implementation Notes

- Add secure headers at the edge/proxy (preferred) or app server:
  - `Strict-Transport-Security`
  - `X-Content-Type-Options`
  - `Referrer-Policy`
  - `Permissions-Policy`
  - `Content-Security-Policy` (CSP) for storefront/admin/dashboard
- Ensure CSP is compatible with SSR and asset pipeline.

## Acceptance Criteria

- Headers are present in production and staging.
- No inline-script exceptions unless explicitly justified.
