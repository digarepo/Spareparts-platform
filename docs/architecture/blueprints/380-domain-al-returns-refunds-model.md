# Blueprint Domain AL — Returns & Refunds Model
**(Authoritative Source of Truth)**

---

## 1. Purpose and Authority

This blueprint defines the **structural semantics governing product returns and financial refunds**.

Its purpose is to:

- Define the meaning of a return
- Separate returns from fulfillment and shipment
- Define refund authority and traceability
- Preserve auditability of post-delivery commerce events

This document is **authoritative**.
Any behavior violating these rules is **non-compliant by design**.

---

## 2. Return Definition (Authoritative)

A **Return** represents the **process by which delivered goods are sent back to the tenant after fulfillment has completed**.

A return answers one question:

> What happens when delivered goods are sent back by a customer?

Returns represent **post-delivery logistics**, not order creation or shipment execution.

---

## 3. Return vs Shipment

Returns and shipments are distinct concepts.

Rules:

- Shipment moves goods **to the customer**
- Return moves goods **back to the tenant**

A return must reference:

- an existing order
- fulfilled items
- a completed shipment

Return operations must never mutate historical shipment records.

---

## 4. Return Scope

Returns operate within strict scope.

Scope includes:

- Tenant
- Order
- Fulfilled items

Rules:

- Returns must remain within the originating tenant
- Returned quantity must not exceed fulfilled quantity
- Returns must reference specific order items

Returns must always remain **bounded and explainable**.

---

## 5. Return Lifecycle

Returns progress through operational states.

Typical states include:

- Requested
- Approved
- In Return Transit
- Received
- Rejected
- Closed

Rules:

- State transitions must be explicit
- All transitions must be auditable
- Invalid transitions must be rejected

Return lifecycle represents **reverse logistics execution**.

---

## 6. Refund Definition

A **Refund** represents the **financial reversal associated with a return or other post-order correction**.

Refunds answer one question:

> What financial compensation is returned to the customer?

Refunds represent **financial correction**, not logistics activity.

---

## 7. Refund vs Return

Returns and refunds are related but independent.

Rules:

- A return may produce a refund
- A refund may occur without a return (for example service correction)
- Refunds must reference an order or payment

Logistics and finance must remain **structurally separated**.

---

## 8. Refund Governance

Refund execution must follow strict governance.

Rules:

- Refunds must reference original payment records
- Refund amounts must be explicit
- Refund actions must be auditable

Retroactive mutation of order payment history is forbidden.

---

## 9. Auditability Requirements

The system must record:

- Return requests
- Approval decisions
- Return shipment receipt
- Refund issuance

Return and refund history must remain **append-only and reconstructable**.

---

## 10. Explicitly Forbidden Anti-Patterns

The following are structural violations:

- Refunds without order reference
- Returns exceeding fulfilled quantity
- Retroactive order mutation
- Shipment history modification

Returns and refunds must remain **explicit, traceable, and governed**.

---

## 11. Outcome (Guaranteed)

Upon approval:

- Reverse logistics becomes structurally defined
- Refund governance becomes auditable
- Financial correction remains separate from logistics

---

## 12. Status

**Status:** Draft
