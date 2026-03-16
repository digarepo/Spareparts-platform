# Blueprint Domain AJ — Shipment Logistics Model
**(Authoritative Source of Truth)**

---

## 1. Purpose and Authority

This blueprint defines the **structural semantics governing shipment logistics**.

Its purpose is to:

- Define what a shipment represents
- Separate transport execution from fulfillment
- Establish carrier and tracking boundaries
- Guarantee auditable transport state

This document is **authoritative**.
Any logistics behavior violating these rules is **non-compliant by design**.

---

## 2. Shipment Definition (Authoritative)

A **Shipment** represents the **transport execution responsible for moving fulfilled goods from a tenant to a destination**.

A shipment answers one question:

> How are fulfilled goods physically transported?

Shipment represents **movement**, not preparation.

---

## 3. Shipment vs Fulfillment

The following separation is mandatory:

- **Fulfillment** prepares goods
- **Shipment** transports goods

Rules:

- Shipment must reference an existing fulfillment
- Shipment must not perform packing or preparation
- Fulfillment may produce multiple shipments

Combining fulfillment and shipment responsibilities is a **structural violation**.

---

## 4. Shipment Identity

Every shipment must have **stable identity**.

Rules:

- Each shipment has a persistent identifier
- Shipment identity must never be reused
- Shipment history must remain traceable

Shipment identity supports operational tracking and dispute resolution.

---

## 5. Shipment Components

A shipment may include:

- Carrier
- Tracking identifier
- Shipping method
- Destination information
- Shipment status

Each component must be **explicitly declared**.

Implicit logistics configuration is forbidden.

---

## 6. Shipment State Model

Shipments operate through observable transport states.

Typical states include:

- Created
- Handed to Carrier
- In Transit
- Out for Delivery
- Delivered
- Failed

Rules:

- State transitions must be explicit
- State transitions must be auditable
- Invalid transitions must be rejected

Shipment state represents **transport progress**, not fulfillment progress.

---

## 7. Carrier Relationship

A **Carrier** represents the external logistics provider responsible for transport.

Rules:

- Carrier identity must be explicit
- Carrier actions must be observable through events
- Carrier operations must not mutate order or fulfillment state

Carriers perform **transport**, not commerce.

---

## 8. Shipment Boundaries

Shipments must respect strict boundaries.

Rules:

- Shipments must remain within a single tenant scope
- Shipments must reference specific fulfilled units
- Shipments must not exceed fulfilled quantities

Transport must always remain **bounded and explainable**.

---

## 9. Auditability Requirements

The system must record:

- Shipment creation
- Carrier handoff
- Transport status changes
- Delivery confirmation

Shipment history must remain **append-only and reconstructable**.

---

## 10. Explicitly Forbidden Anti-Patterns

The following are structural violations:

- Shipment without fulfillment
- Carrier modifying fulfillment state
- Shipment defining inventory state
- Shipment mutating order pricing
- Implicit transport state changes

Logistics execution must remain **separate, explicit, and auditable**.

---

## 11. Outcome (Guaranteed)

Upon approval:

- Shipment meaning becomes unambiguous
- Fulfillment and logistics remain properly separated
- Carrier operations remain observable
- Transport lifecycle becomes auditable

---

## 12. Status

**Status:** Draft
