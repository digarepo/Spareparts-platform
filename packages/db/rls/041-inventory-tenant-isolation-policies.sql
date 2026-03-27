-- =============================================================================
-- ENHANCED AUDIT TRIGGER FOR INVENTORY CHANGES
-- =============================================================================

-- Function to automatically create audit events for inventory changes
CREATE OR REPLACE FUNCTION create_inventory_audit_event()
RETURNS TRIGGER AS $$
DECLARE
    audit_reason TEXT;
    audit_initiated_by TEXT;
    audit_metadata JSONB;
BEGIN
    -- Only create audit events for actual data changes
    IF TG_OP = 'UPDATE' AND (
        OLD.on_hand_quantity IS NOT DISTINCT FROM NEW.on_hand_quantity AND
        OLD.reserved_quantity IS NOT DISTINCT FROM NEW.reserved_quantity AND
        OLD.allocated_quantity IS NOT DISTINCT FROM NEW.allocated_quantity AND
        OLD.is_active IS NOT DISTINCT FROM NEW.is_active AND
        OLD.is_sellable IS NOT DISTINCT FROM NEW.is_sellable
    ) THEN
        RETURN NEW;
    END IF;

    -- Get reason from session variable (set by application) or use default
    audit_reason := COALESCE(
        current_setting('app.audit_reason', true),
        CASE TG_OP
            WHEN 'INSERT' THEN 'System initialization'
            WHEN 'UPDATE' THEN 'System update'
            ELSE 'Unknown operation'
        END
    );

    -- Get initiated_by from session variable (set by application) or default
    audit_initiated_by := COALESCE(
        current_setting('app.current_identity_id', true),
        'system'
    );

    -- Build comprehensive metadata
    audit_metadata := jsonb_build_object(
        'operation', TG_OP,
        'timestamp', now(),
        'system', 'inventory_rls_trigger',
        'table', TG_TABLE_NAME,
        'user_agent', current_setting('app.user_agent', true),
        'ip_address', current_setting('app.ip_address', true)
    );

    -- Add application-provided metadata if available
    IF current_setting('app.audit_metadata', true) IS NOT NULL THEN
        audit_metadata := audit_metadata ||
            COALESCE(current_setting('app.audit_metadata', true)::jsonb, '{}'::jsonb);
    END IF;

    INSERT INTO inventory_audit_events (
        tenant_id,
        inventory_id,
        event_type,
        before_state,
        after_state,
        reason,
        initiated_by,
        metadata
    ) VALUES (
        NEW.tenant_id,
        NEW.id,
        CASE TG_OP
            WHEN 'INSERT' THEN 'inventory_created'
            WHEN 'UPDATE' THEN 'inventory_updated'
            ELSE 'unknown'
        END,
        CASE TG_OP
            WHEN 'UPDATE' THEN json_build_object(
                'onHand', OLD.on_hand_quantity,
                'reserved', OLD.reserved_quantity,
                'allocated', OLD.allocated_quantity,
                'available', OLD.on_hand_quantity - OLD.reserved_quantity - OLD.allocated_quantity,
                'isActive', OLD.is_active,
                'isSellable', OLD.is_sellable,
                'lowStockThreshold', OLD.low_stock_threshold
            )
            ELSE NULL
        END,
        json_build_object(
            'onHand', NEW.on_hand_quantity,
            'reserved', NEW.reserved_quantity,
            'allocated', NEW.allocated_quantity,
            'available', NEW.on_hand_quantity - NEW.reserved_quantity - NEW.allocated_quantity,
            'isActive', NEW.is_active,
            'isSellable', NEW.is_sellable,
            'lowStockThreshold', NEW.low_stock_threshold
        ),
        audit_reason,
        audit_initiated_by,
        audit_metadata
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced trigger for automatic audit event creation
CREATE TRIGGER inventory_items_audit_trigger
AFTER INSERT OR UPDATE ON inventory_items
FOR EACH ROW EXECUTE FUNCTION create_inventory_audit_event();

-- =============================================================================
-- SESSION VARIABLE SETTING FUNCTIONS (For Application Use)
-- =============================================================================

-- Function to set audit context for inventory operations
CREATE OR REPLACE FUNCTION set_inventory_audit_context(
    p_reason TEXT,
    p_metadata JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.audit_reason', p_reason, true);
    IF p_metadata IS NOT NULL THEN
        PERFORM set_config('app.audit_metadata', p_metadata::text, true);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clear audit context
CREATE OR REPLACE FUNCTION clear_inventory_audit_context()
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.audit_reason', NULL, true);
    PERFORM set_config('app.audit_metadata', NULL, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
