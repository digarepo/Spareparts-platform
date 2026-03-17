# Task: TENANTUI11-090 — Payments Outcomes Visibility (Tenant-observable)

## Purpose

Show payment outcomes relevant to the tenant without exposing sensitive payment method data.

## Implementation Notes

- Add route module `/payments`.
- Provide tenant-visible summaries:
  - paid/unpaid/refunded counts (as defined by backend)
  - failures and reason codes
- Allow drilldown to order/payment references only as permitted.
- Prohibit:
  - raw payment method details
  - customer PII unless explicitly permitted

## Acceptance Criteria

- Payments outcomes are visible in a privacy-safe way.
- No payment mutation actions exist unless explicitly tenant-owned and modeled.
