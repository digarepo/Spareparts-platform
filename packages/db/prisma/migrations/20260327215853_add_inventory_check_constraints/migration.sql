-- Add check constraints for inventory data integrity

-- InventoryItem constraints
ALTER TABLE inventory_items
ADD CONSTRAINT inventory_items_on_hand_quantity_non_negative
CHECK (on_hand_quantity >= 0);

ALTER TABLE inventory_items
ADD CONSTRAINT inventory_items_reserved_quantity_non_negative
CHECK (reserved_quantity >= 0);

ALTER TABLE inventory_items
ADD CONSTRAINT inventory_items_allocated_quantity_non_negative
CHECK (allocated_quantity >= 0);

ALTER TABLE inventory_items
ADD CONSTRAINT inventory_items_no_oversubscription
CHECK ((reserved_quantity + allocated_quantity) <= on_hand_quantity);

ALTER TABLE inventory_items
ADD CONSTRAINT inventory_items_low_stock_threshold_non_negative
CHECK (low_stock_threshold IS NULL OR low_stock_threshold >= 0);

-- InventoryReservation constraints
ALTER TABLE inventory_reservations
ADD CONSTRAINT inventory_reservations_quantity_positive
CHECK (quantity > 0);

ALTER TABLE inventory_reservations
ADD CONSTRAINT inventory_reservations_valid_status
CHECK (status IN ('active', 'released', 'expired'));

ALTER TABLE inventory_reservations
ADD CONSTRAINT inventory_reservations_valid_purpose
CHECK (purpose IN ('cart', 'order', 'manual', 'system'));

-- InventoryAllocation constraints
ALTER TABLE inventory_allocations
ADD CONSTRAINT inventory_allocations_quantity_positive
CHECK (quantity > 0);

ALTER TABLE inventory_allocations
ADD CONSTRAINT inventory_allocations_valid_purpose
CHECK (purpose IN ('order', 'fulfillment'));

-- StockMovement constraints
ALTER TABLE stock_movements
ADD CONSTRAINT stock_movements_quantity_positive
CHECK (quantity > 0);

ALTER TABLE stock_movements
ADD CONSTRAINT stock_movements_valid_movement_type
CHECK (movement_type IN ('increase', 'decrease', 'adjustment'));

ALTER TABLE stock_movements
ADD CONSTRAINT stock_movements_reason_not_empty
CHECK (LENGTH(reason) > 0);

-- InventoryAuditEvent constraints
ALTER TABLE inventory_audit_events
ADD CONSTRAINT inventory_audit_events_reason_not_empty
CHECK (LENGTH(reason) > 0);

ALTER TABLE inventory_audit_events
ADD CONSTRAINT inventory_audit_events_event_type_not_empty
CHECK (LENGTH(event_type) > 0);
