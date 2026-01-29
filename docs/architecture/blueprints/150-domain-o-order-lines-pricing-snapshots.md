# Blueprint Domain O — Order Lines, Pricing Snapshots & References
**(Authoritative Source of Truth)**

---

## 1. Purpose and Authority

This blueprint defines the **structural rules** governing:

- Order line item meaning and boundaries
- How orders reference products, variants, and prices
- Pricing snapshot semantics and immutability
- Historical correctness and audit guarantees

Its purpose is to ensure that **orders remain stable historical facts** even as catalog and pricing evolve.

This document is **authoritative**.
Any order behavior that violates these rules is **non-compliant by design**.

---

## 2. Core Concepts (Closed Set)

The order composition model consists of **three inseparable concepts**:

1. **Order Line Item** — the atomic unit of commitment
2. **Catalog Reference** — what was purchased
3. **Pricing Snapshot** — the agreed commercial terms

These concepts are related but **not interchangeable**.

---

## 3. Order Line Item (Authoritative)

### 3.1 Definition

An **Order Line Item** represents a **single committed purchase unit** within an order.

A line item:

- Refers to exactly one product or variant
- Specifies a committed quantity
- Anchors exactly one pricing snapshot
- Is immutable in meaning once created

A line item answers:
> “What exactly was committed in this order?”

Line items are the **atomic units of commitment**.

---

### 3.2 What a Line Item Is NOT

A line item is not:

- A cart item
- A pricing rule
- An inventory record
- A fulfillment instruction
- A payment transaction

If a line item executes behavior, the model is broken.

---

## 4. Line Item Scope, Ownership & Isolation

The following rules are binding:

- Each line item belongs to **exactly one order**
- Each line item is associated with **exactly one tenant seller**
- Line items from different tenants are **logically isolated**
- No line item may span multiple tenants

Multi-tenant orders are **compositions of isolated commitments**, not shared ones.

---

## 5. Line Item Quantity Semantics

Quantity rules are non-negotiable:

- Quantity is expressed in **inventory units**
- Quantity must be **whole and non-negative**
- Quantity represents **committed intent**

Quantity must not:

- Be inferred from inventory state
- Change silently after order creation
- Be fractional

Quantity is part of the contract.

---

## 6. Catalog References (Product & Variant)

### 6.1 Reference Rules

Each line item must reference catalog entities explicitly:

- **Product reference** identifies *what* was purchased
- **Variant reference** identifies *which configuration*

Rules:

- References must be stable and immutable
- References must remain valid even if catalog entries are retired
- References must not be dynamically re-resolved

Orders refer to **catalog as-was**, not catalog as-is.

---

### 6.2 Reference Non-Authority Rule

Catalog references must **never**:

- Pull live catalog data into existing orders
- Change meaning due to catalog edits
- Be replaced to “fix” historical orders

Historical correctness overrides convenience.

---

## 7. Pricing Snapshot (Authoritative)

### 7.1 Definition

A **Pricing Snapshot** represents the **exact commercial terms agreed at order creation**.

A pricing snapshot:

- Captures price as-of order creation
- Is scoped to a single line item
- Is immutable once created

A pricing snapshot answers:
> “What price did the customer agree to pay for this line item?”

---

### 7.2 Snapshot vs Live Pricing (Hard Boundary)

The following separation is absolute:

- **Live prices** may change over time
- **Pricing snapshots** never change

Rules:

- Order totals must be derived exclusively from snapshots
- Live pricing must not affect existing orders
- Snapshots must not be recalculated, refreshed, or normalized

Orders are **historical records**, not live views.

---

## 8. Price Ownership and Attribution

Pricing snapshot attribution rules:

- Snapshots reflect **tenant-defined prices**
- Snapshots are attributed to the selling tenant
- The platform records prices but does not author them

Recording does not imply control.

---

## 9. Line Item Independence

Each line item is independent.

Rules:

- Line items must not affect each other’s pricing
- Line items must not share mutable state
- Failure or cancellation of one line item must not corrupt others

Isolation is required for correctness and auditability.

---

## 10. Immutability and Governance

After order creation:

- Line items must not be silently mutated
- Pricing snapshots must not be edited
- Catalog references must not be reassigned

Any change requires:

- Explicit governance
- Auditability
- Compensating actions where applicable

Silent mutation is forbidden.

---

## 11. Historical Correctness Guarantees

The platform must guarantee:

- Past orders remain interpretable
- Pricing disputes can be resolved
- Catalog evolution does not rewrite history
- Audits can reconstruct exact commitments

Historical meaning must never change.

---

## 12. Explicitly Forbidden Anti-Patterns

The following are **structural violations**:

- Repricing existing orders
- Re-resolving catalog references
- Inferring line items from cart state
- Sharing line items across tenants
- Encoding discounts by mutating line items
- “Fixing” old orders by overwriting data

Orders must remain **factually correct**, not cosmetically updated.

---

## 13. Auditability Requirement

The system must be able to answer:

- What was purchased?
- In what quantity?
- At what price?
- From which tenant?
- Under which catalog state?

Order composition must be **fully reconstructable**.

---

## 14. Outcome (Guaranteed)

Upon approval:

- Orders are stable historical contracts
- Pricing disputes are resolvable
- Catalog and pricing changes do not affect past orders
- Multi-tenant ordering remains isolated and safe
- Audits rely on structure, not inference

---

## 15. Status

**Status:** Approved
