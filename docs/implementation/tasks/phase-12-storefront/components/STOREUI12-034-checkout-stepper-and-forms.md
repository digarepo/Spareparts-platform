# Task: STOREUI12-034 — Checkout Stepper + Guest-first Forms

## Purpose

Provide checkout UI with guest-first flow while allowing optional account sign-in.

## Implementation Notes

Implement components:
- `CheckoutStepper`
- `CheckoutContactForm` (guest email required)
- `CheckoutShippingForm`
- `CheckoutReview`
- `CheckoutPaymentSection`

Rules:
- order creation is explicit
- show per-tenant breakdown at review

## Acceptance Criteria

- Guest checkout can proceed without account.
- Review step displays per-tenant breakdown.
