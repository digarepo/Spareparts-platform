# Blueprint Domain N — Cart & Order Intent Model
**(Authoritative Source of Truth)**

---

## 1. Purpose and Authority

This blueprint defines the **structural intent model** for **Carts** and **Orders**.

Its purpose is to:

- Draw an unambiguous boundary between **intent** and **commitment**
- Prevent carts from becoming implicit orders
- Prevent orders from implying payment, inventory, or fulfillment behavior
- Establish stable ownership, scope, and lifecycle meaning

This document is **authoritative**.
Any behavior that violates these rules is **non-compliant by design**.

---

## 2. Core Concepts (Closed Set)

The system recognizes **two distinct intent constructs**:

1. **Cart** — temporary, non-binding intent
2. **Order** — explicit, binding commitment

These concepts are related but **not interchangeable**.

---

## 3. Cart Model (Authoritative)

### 3.1 What a Cart Is

A **Cart** represents a **temporary expression of customer purchase intent**.

A cart:

- Captures *what a customer is considering*
- Is mutable and reversible
- Exists prior to commitment
- Has no contractual meaning

A cart answers:
> “What does the customer intend to buy right now?”

---

### 3.2 What a Cart Is NOT

A cart is not:

- An order
- A reservation
- A payment commitment
- A fulfillment instruction
- A tenant obligation

If a cart creates obligation, the model is broken.

---

### 3.3 Cart Ownership and Scope

Ownership and scope rules are binding:

- A cart belongs to **exactly one customer context**
- A cart exists in **customer scope only**
- A cart may reference items from **multiple tenants**
- A cart is never tenant-owned

Tenants must never see or control carts directly.

---

### 3.4 Cart Contents (Intent Snapshots)

A cart may reference:

- Products or variants
- Intended quantities
- Observed prices at time of addition

Rules:

- Cart contents are **snapshots of intent**
- Cart references must not mutate catalog, inventory, or pricing
- Cart data may become stale without correction

Staleness is acceptable; silent mutation is not.

---

### 3.5 Cart Lifecycle Characteristics

Carts are **ephemeral**.

Rules:

- Carts may be created implicitly or explicitly
- Carts may be modified freely
- Carts may be abandoned without consequence
- Carts have no audit or financial significance

Carts must not require cleanup for correctness.

---

## 4. Order Model (Authoritative)

### 4.1 What an Order Is

An **Order** represents a **customer’s committed intent to purchase** under specific terms.

An order:

- Is created intentionally
- Represents a binding request for fulfillment
- Anchors pricing, inventory allocation, and payment flows

An order answers:
> “What has the customer committed to buy?”

---

### 4.2 What an Order Is NOT

An order is not:

- A cart
- A payment record
- A fulfillment record
- An inventory state

Orders express **commitment**, not execution.

---

### 4.3 Order Ownership and Scope

Ownership rules are binding:

- An order is owned by **exactly one customer**
- An order may involve **multiple tenant sellers**
- Each tenant’s responsibility is **logically isolated**

Orders are **customer-owned**, but **tenant-responsible**.

---

### 4.4 Order Identity and Stability

Orders have **stable identity**.

Rules:

- Order identity is unique and persistent
- Order identity is never reused
- Orders remain referencable indefinitely

Order identity anchors downstream processes but does not execute them.

---

## 5. Cart vs Order (Hard Boundary)

The following invariants are **non-negotiable**:

- Cart = intent (reversible)
- Order = commitment (binding)
- Cart mutation must not affect existing orders
- Orders must never be created implicitly
- Payment success must not create orders implicitly

If intent and commitment blur, the system is unsafe.

---

## 6. Order Lifecycle States (Conceptual)

Orders progress through **explicit lifecycle states** from commitment to termination.

Recognized conceptual phases include:

- **Created** — intent committed
- **Confirmed** — validated and accepted
- **In Progress** — execution underway
- **Completed** — concluded successfully
- **Cancelled** — terminated without completion
- **Failed** — could not proceed

Rules:

- States represent **business meaning**
- Transitions must be explicit
- States must not be skipped implicitly

Lifecycle is **semantic**, not technical.

---

## 7. Lifecycle Authority Rules

Authority is scope-bound:

- Customers may initiate order creation and permitted cancellation
- Tenants may progress fulfillment-related states
- Platform staff may observe but not mutate tenant orders

All transitions must be:

- Authorized
- Intentional
- Auditable

---

## 8. Immutability and Governance

Once created:

- Core order intent must not change silently
- Pricing snapshots must not be rewritten
- Product and variant references must remain stable

Order mutation is **governed**, not free-form.

---

## 9. Explicit Non-Implications (Hard Boundaries)

Carts and orders must **never imply**:

- Inventory reservation or allocation
- Payment success or failure
- Fulfillment progress or completion
- Availability guarantees

Each concern is governed independently.

---

## 10. Failure and Exceptional States

Failure semantics:

- Must be explicit
- Must preserve history
- Must not rewrite intent
- Must not create duplicate commitments

Failure is a **state**, not an absence.

---

## 11. Auditability Requirement

The system must be able to answer:

- Who created the cart or order?
- When did intent become commitment?
- What was committed?
- How did lifecycle states change?

Intent and commitment must be **reconstructable and explainable**.

---

## 12. Explicitly Forbidden Anti-Patterns

The following are **structural violations**:

- Treating carts as soft orders
- Implicit order creation
- Inventory control from carts
- Payment-driven order creation
- Tenant-visible customer carts
- Silent order mutation

Orders are **contracts**, not side effects.

---

## 13. Outcome (Guaranteed)

Upon approval:

- Customer intent is cleanly modeled
- Commitment boundaries are explicit
- Inventory, payment, and fulfillment remain decoupled
- Orders provide a stable anchor for downstream logic
- Audits and disputes have a reliable source of truth

---

## 14. Status

**Status:** Approved
