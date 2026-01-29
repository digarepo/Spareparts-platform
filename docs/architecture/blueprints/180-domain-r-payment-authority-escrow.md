# Blueprint Domain R — Payment Authority, Control & Escrow Semantics
**(Authoritative Source of Truth)**

---

## 1. Purpose and Authority

This blueprint defines the **structural authority boundaries**, **control semantics**, and **escrow concepts** governing all payment-related actions.

Its purpose is to:

- Make financial authority explicit and bounded
- Prevent money control from redefining order or fulfillment meaning
- Preserve tenant isolation and auditability
- Ensure escrow and holds remain protective mechanisms, not business logic

This document is **authoritative**.
Any payment behavior that violates these rules is **non-compliant by design**.

---

## 2. Core Concepts (Closed Set)

The platform recognizes **four distinct financial control concepts**:

1. **Payment Ownership** — which obligation the money belongs to
2. **Payment Authority** — who may act on the payment
3. **Financial Control** — how funds are temporarily restricted or held
4. **Resolution** — how controlled funds are finally disposed

These concepts are related but **not interchangeable**.

---

## 3. Payment Ownership Semantics (Authoritative)

### 3.1 Ownership Definition

**Payment ownership** identifies the **commercial obligation** a payment satisfies.

Rules:

- Each payment is owned by **exactly one tenant obligation**
- Ownership is derived from the order structure
- Ownership must never be inferred from execution mechanics
- Platform ownership is **explicit only**, never default

Ownership answers:
> “For which tenant obligation is this money intended?”

---

### 3.2 Ownership Does Not Imply Control

Ownership does **not** grant authority to:

- Initiate payment actions
- Capture or release funds
- Modify payment records

Ownership defines **destination**, not **control**.

---

## 4. Authority Boundaries (Non-Negotiable)

Authority defines **who may perform financial actions**.

Authority must always be:

- Explicit
- Scope-validated
- Evaluated per action

No payment action may rely on implied authority.

---

## 5. Customer Authority

Customers may:

- Initiate payment attempts
- Authorize holds or payment intent
- Initiate cancellation or reversal **only where explicitly permitted**

Customers must not:

- Edit payment records
- Reassign payment ownership
- Mutate settled or terminal outcomes

Customer authority is **intent-based**, not administrative.

---

## 6. Tenant Authority

Tenants may:

- Observe payment outcomes related to their obligations
- Act on outcomes for fulfillment decisions
- Initiate tenant-scoped requests permitted by policy (e.g., refund request)

Tenants must not:

- Execute customer payments
- Capture or release customer funds
- Modify payment state directly
- Access other tenants’ payment data

Tenant authority is **commercially scoped**, not operational.

---

## 7. Platform Authority

The Platform Owner Organization may:

- Facilitate and orchestrate payment flows
- Enforce compliance and policy constraints
- Control escrow mechanisms **only under explicit policy**
- Observe and audit payments across tenants

The platform must not:

- Redefine payment ownership
- Act as a default counterparty
- Mutate tenant payment outcomes without explicit authority

Platform authority is **governance-oriented**, not commercial.

---

## 8. Authority Validation Rule

Every payment action must satisfy **all** of the following:

1. Explicit authority is declared
2. Authority scope is validated (customer, tenant, platform)
3. Action is permitted under policy
4. Action is attributable and auditable

Failure of any condition must block the action.

---

## 9. Financial Control Concepts (Authoritative)

Financial control governs **temporary restriction or custody of funds**.
It does **not** redefine payment outcome or business meaning.

---

## 10. Hold Semantics

### 10.1 Hold Definition

A **Hold** represents a **temporary restriction** on customer funds.

Characteristics:

- Funds remain owned by the customer
- Funds are not transferred to any tenant
- Hold exists pending a future explicit decision

Rules:

- A hold does not satisfy a payment obligation
- A hold does not imply order success
- A hold must resolve explicitly

A hold answers:
> “Are funds temporarily blocked?”

---

## 11. Escrow Semantics

### 11.1 Escrow Definition

**Escrow** represents **conditional custody** of funds pending fulfillment or policy conditions.

Characteristics:

- Funds are controlled but not yet released
- Final ownership resolution is conditional
- Escrow protects both customer and tenant interests

Rules:

- Escrow does not imply fulfillment completion
- Escrow does not redefine order commitment
- Escrow must resolve explicitly

Escrow answers:
> “Who controls the funds while conditions are unmet?”

---

## 12. Release Semantics

### 12.1 Release Definition

A **Release** is an **explicit resolution** of held or escrowed funds.

Release outcomes may include:

- Transfer to the tenant
- Return to the customer
- Policy-defined redirection

Rules:

- Release is deliberate and authorized
- Release finalizes hold or escrow
- Release must be auditable

Release answers:
> “What is the final disposition of the funds?”

---

## 13. Control vs Payment State (Hard Boundary)

The following separation is binding:

- **Payment state** records financial outcome
- **Holds and escrow** record fund control

Rules:

- Holds must not be treated as payment success
- Escrow must not be treated as settlement
- Payment terminal state must not be inferred from escrow resolution

Financial control must not obscure financial truth.

---

## 14. Resolution Guarantees

All holds and escrow must:

- Resolve to an explicit terminal outcome
- Not persist indefinitely
- Be observable and auditable

Unresolved financial control is a **system defect**.

---

## 15. Multi-Tenant Isolation Rule

In multi-tenant orders:

- Payment authority is evaluated per tenant obligation
- Escrow and release occur per tenant obligation
- One tenant must not influence another tenant’s funds
- Cross-tenant pooling of escrow is forbidden

Isolation is mandatory for financial correctness.

---

## 16. Failure and Safety Semantics

If a hold, escrow, or release action fails:

- Funds must remain safely controlled
- Partial resolution must not persist silently
- Failure must be observable and auditable

Safety overrides speed and convenience.

---

## 17. What Payment Control Does NOT Imply

Payment authority, holds, or escrow must **never imply**:

- Order success or failure
- Fulfillment start or completion
- Inventory reservation or allocation
- Tenant fault or customer intent

Financial control is **protective**, not decisional.

---

## 18. Explicitly Forbidden Anti-Patterns

The following are **structural violations**:

- Platform-assumed payment ownership
- Tenant-controlled fund release
- Treating holds as paid
- Auto-releasing escrow without explicit signal
- Indefinite escrow without resolution path
- Payment control redefining order meaning

Authority and control must remain **explicit and bounded**.

---

## 19. Auditability Requirement

The platform must be able to answer:

- Who initiated each payment action?
- Under which authority and scope?
- What control (hold/escrow) existed at each moment?
- What conditions governed release?
- How and when funds were resolved?

Financial authority decisions must be **fully reconstructable**.

---

## 20. Outcome (Guaranteed)

Upon approval:

- Financial authority boundaries are unambiguous
- Escrow and holds are semantically clean and safe
- Tenant isolation is preserved end-to-end
- Payment control does not leak into business logic
- Audits and disputes are defensible and precise

---

## 21. Status

**Status:** Approved
