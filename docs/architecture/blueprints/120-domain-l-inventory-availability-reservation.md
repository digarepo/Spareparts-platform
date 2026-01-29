# Blueprint Domain L — Availability, Sellability & Reservation Semantics
**(Authoritative Source of Truth)**

---

## 1. Purpose and Authority

This blueprint defines the **structural semantics** governing:

- Inventory **on-hand**, **available**, and **sellable** states
- **Reservation** vs **allocation** meaning
- Temporary vs committed use of stock
- Explicit non-implications of availability and reservation

Its purpose is to prevent implicit authorization, double-selling, and semantic leakage between inventory, catalog, and ordering concerns.

This document is **authoritative**.
Any behavior that violates these semantics is **non-compliant by design**.

---

## 2. Core Inventory State Definitions (Closed Set)

The system recognizes **three distinct inventory-related states**:

1. **On-Hand Inventory**
2. **Available Inventory**
3. **Sellable State**

These states are related but **not interchangeable**.

---

## 3. On-Hand Inventory (Authoritative)

### 3.1 Definition

**On-Hand Inventory** represents the **total quantity of inventory units controlled by a tenant** for a given product or variant.

On-hand inventory:

- Is a raw operational quantity
- Includes all units under tenant control
- Is independent of reservations, allocations, or policy holds

On-hand answers:
> “How much stock exists under tenant control?”

---

### 3.2 On-Hand Non-Authority Rule

On-hand inventory **does not** imply:

- Availability
- Sellability
- Reservation eligibility
- Allocation readiness
- Customer exposure

On-hand is **descriptive**, not permissive.

---

## 4. Available Inventory (Authoritative)

### 4.1 Definition

**Available Inventory** is the **subset of on-hand inventory eligible to be reserved or allocated** at a given moment.

Availability:

- Is derived from on-hand inventory
- Is reduced by reservations, allocations, or holds
- Is dynamic and context-sensitive

Available answers:
> “What portion of stock may be committed right now?”

---

### 4.2 Availability Boundary Rules

Availability:

- Must never exceed on-hand inventory
- Must never be increased implicitly
- Must be computed explicitly and deterministically

Availability is **operational eligibility**, not permission to sell.

---

## 5. Sellable State (Authoritative)

### 5.1 Definition

**Sellability** represents whether a product or variant **may be offered to customers for purchase attempt**.

Sellability:

- Is a **decision outcome**, not a quantity
- Is evaluated per product or variant
- Depends on multiple independent conditions

Sellable answers:
> “May a customer attempt to buy this?”

---

### 5.2 Sellability Boundary Rules

Sellability:

- Does not guarantee fulfillment
- Does not reserve inventory
- Does not allocate inventory
- Must not be inferred from quantity alone

Sellability is **authorization to attempt**, not commitment.

---

## 6. Hard Separation: On-Hand vs Available vs Sellable

The following invariants are **non-negotiable**:

- On-hand > 0 does **not** imply availability
- Availability > 0 does **not** imply sellability
- Sellability does **not** imply sufficient availability

Each state must be evaluated **independently**.

---

## 7. Reservation Semantics (Authoritative)

### 7.1 Definition

A **Reservation** is a **temporary, revocable claim** against available inventory.

Reservation:

- Reduces available inventory
- Does not reduce on-hand inventory
- Does not guarantee fulfillment

A reservation answers:
> “This stock is being considered for possible commitment.”

---

### 7.2 Reservation Characteristics

Reservations are:

- Temporary by nature
- Scoped to a single tenant and product/variant
- Associated with a specific intent
- Reversible without compensation

Reservation is **optimistic**, not final.

---

## 8. Allocation Semantics (Authoritative)

### 8.1 Definition

An **Allocation** is a **committed assignment** of inventory to a specific fulfillment obligation.

Allocation:

- Reduces available inventory durably
- Represents a fulfillment commitment
- Is not reversible without explicit compensating action

An allocation answers:
> “This stock is committed to fulfillment.”

---

### 8.2 Allocation Characteristics

Allocations are:

- Durable with respect to availability
- Tied to a specific obligation
- Explicit and auditable
- Final in intent

Allocation represents **commitment**, not consideration.

---

## 9. Reservation vs Allocation (Hard Boundary)

The following rules are binding:

- Reservation is **temporary and revocable**
- Allocation is **committed and durable**
- Reservation must logically precede allocation
- Allocation must never be inferred implicitly

Collapsing these concepts is a **structural violation**.

---

## 10. Temporary vs Committed Stock Usage

### 10.1 Temporary Usage

Temporary usage:

- Occurs through reservation
- Reduces availability only
- Must be reversible
- Must not imply fulfillment

---

### 10.2 Committed Usage

Committed usage:

- Occurs through allocation
- Represents fulfillment intent
- Requires explicit authority
- Must be auditable

Temporary usage is **exploratory**; committed usage is **binding**.

---

## 11. What Availability, Reservation, and Allocation Do NOT Imply

The following **must never be inferred**:

- Reservation does not imply order existence
- Allocation does not imply payment success
- Availability does not imply catalog visibility
- Sellability does not imply fulfillment guarantee
- Allocation does not imply shipment or delivery

Each concern is governed independently.

---

## 12. Safety and Ambiguity Rule

If any of the following cannot be determined with certainty:

- Availability
- Sellability
- Reservation eligibility
- Allocation eligibility

Then the system must behave as if the product is **not sellable** and **no commitment may occur**.

Safety overrides convenience.

---

## 13. Auditability and Explainability

The system must be able to explain:

- Why stock was available or unavailable
- Why a product was sellable or not
- What reservations or allocations existed
- Who or what initiated them
- When the state changed

If a decision cannot be explained, it is invalid.

---

## 14. Explicitly Forbidden Anti-Patterns

The following are **structural violations**:

- Selling directly from on-hand quantity
- Treating availability as permission to sell
- Permanent reservations
- Allocation without explicit intent
- Customer-visible inventory quantities
- Implicit reservation or allocation

Inventory commitment must be **intentional and traceable**.

---

## 15. Outcome (Guaranteed)

Upon approval:

- Inventory states are semantically clear
- Overcommitment risks are structurally reduced
- Sellability remains a governed decision
- Reservation and allocation semantics are unambiguous
- Downstream order logic has a clean, safe contract

---

## 16. Status

**Status:** Approved
