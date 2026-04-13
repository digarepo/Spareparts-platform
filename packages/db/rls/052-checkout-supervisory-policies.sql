-- =============================================================================
-- CHECKOUT SUPERVISORY POLICIES (Enhanced with System Actor Management)
-- =============================================================================
-- Platform supervisor read-only access and audit triggers
-- System actor context management for automated processes

-- =============================================================================
-- SYSTEM ACTOR CONTEXT MANAGEMENT
-- =============================================================================

-- Function to set system actor context for automated processes
CREATE OR REPLACE FUNCTION set_system_context(p_identity_id TEXT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.actor_kind', 'system', true);
    IF p_identity_id IS NOT NULL THEN
        PERFORM set_config('app.current_identity_id', p_identity_id, true);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clear system context
CREATE OR REPLACE FUNCTION clear_system_context()
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.actor_kind', NULL, true);
    PERFORM set_config('app.current_identity_id', NULL, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- ENHANCED AUDIT TRIGGER FOR CART STATUS CHANGES
-- =============================================================================

CREATE OR REPLACE FUNCTION create_cart_status_history()
RETURNS TRIGGER AS $$
DECLARE
    audit_reason TEXT;
    audit_initiated_by TEXT;
    audit_metadata JSONB;
    cart_status_record RECORD;
BEGIN
    -- Skip if status hasn't changed
    IF TG_OP = 'UPDATE' AND OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;

    -- Get audit context with fallback hierarchy
    audit_initiated_by := COALESCE(
        current_setting('app.current_identity_id', true),
        current_setting('app.current_customer_id', true),
        'system'
    );

    -- Get reason from session variable or use intelligent defaults
    audit_reason := COALESCE(
        current_setting('app.audit_reason', true),
        CASE TG_OP
            WHEN 'INSERT' THEN 'Cart created'
            WHEN 'UPDATE' THEN
                CASE
                    WHEN NEW.status = 'deleted' THEN 'Cart soft-deleted'
                    WHEN NEW.status = 'expired' THEN 'Cart expired'
                    WHEN NEW.status = 'converted' THEN 'Cart converted to order'
                    ELSE 'Cart status updated'
                END
            ELSE 'Unknown operation'
        END
    );

    -- Build comprehensive metadata with business context
    audit_metadata := jsonb_build_object(
        'operation', TG_OP,
        'timestamp', now(),
        'system', 'checkout_rls_trigger',
        'table', TG_TABLE_NAME,
        'user_agent', current_setting('app.user_agent', true),
        'ip_address', current_setting('app.ip_address', true),
        'actor_kind', app.current_actor_kind()
    );

    -- Add cart-specific business context
    IF TG_OP = 'UPDATE' THEN
        -- Get status information for business context
        SELECT isModifiable, isConvertible, isDeleted
        INTO cart_status_record
        FROM cart_status WHERE code = NEW.status;

        IF FOUND THEN
            audit_metadata := audit_metadata || jsonb_build_object(
                'status_modifiable', cart_status_record.isModifiable,
                'status_convertible', cart_status_record.isConvertible,
                'status_deleted', cart_status_record.isDeleted
            );
        END IF;

        -- Add cart statistics for analytics
        audit_metadata := audit_metadata || jsonb_build_object(
            'cart_item_count', (SELECT COUNT(*) FROM cart_items WHERE cartId = NEW.id),
            'cart_subtotal', NEW.subtotalAmount,
            'cart_total_items', NEW.totalItems
        );
    END IF;

    -- Merge application-provided metadata if available
    IF current_setting('app.audit_metadata', true) IS NOT NULL THEN
        audit_metadata := audit_metadata ||
            COALESCE(current_setting('app.audit_metadata', true)::jsonb, '{}'::jsonb);
    END IF;

    -- Insert comprehensive history record
    INSERT INTO cart_status_history (
        cartId,
        tenantId,
        previousStatus,
        newStatus,
        changedBy,
        actorType,
        reason,
        changedAt
    ) VALUES (
        NEW.id,
        NEW.tenantId,
        CASE TG_OP WHEN 'UPDATE' THEN OLD.status ELSE NULL END,
        NEW.status,
        audit_initiated_by,
        app.current_actor_kind(),
        audit_reason,
        now()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for cart status changes
CREATE TRIGGER cart_status_history_trigger
AFTER INSERT OR UPDATE ON carts
FOR EACH ROW EXECUTE FUNCTION create_cart_status_history();

-- =============================================================================
-- ENHANCED AUDIT TRIGGER FOR ORDER STATUS CHANGES
-- =============================================================================

CREATE OR REPLACE FUNCTION create_order_status_history()
RETURNS TRIGGER AS $$
DECLARE
    audit_reason TEXT;
    audit_initiated_by TEXT;
    audit_metadata JSONB;
    order_status_record RECORD;
BEGIN
    -- Skip if status hasn't changed
    IF TG_OP = 'UPDATE' AND OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;

    -- Get audit context with fallback hierarchy
    audit_initiated_by := COALESCE(
        current_setting('app.current_identity_id', true),
        current_setting('app.current_customer_id', true),
        'system'
    );

    -- Get reason from session variable or use intelligent defaults
    audit_reason := COALESCE(
        current_setting('app.audit_reason', true),
        CASE TG_OP
            WHEN 'INSERT' THEN 'Order created'
            WHEN 'UPDATE' THEN
                CASE
                    WHEN NEW.status = 'confirmed' THEN 'Order confirmed by tenant'
                    WHEN NEW.status = 'shipped' THEN 'Order shipped'
                    WHEN NEW.status = 'delivered' THEN 'Order delivered'
                    WHEN NEW.status = 'cancelled' THEN 'Order cancelled'
                    WHEN NEW.status = 'failed' THEN 'Order processing failed'
                    ELSE 'Order status updated'
                END
            ELSE 'Unknown operation'
        END
    );

    -- Build comprehensive metadata with business context
    audit_metadata := jsonb_build_object(
        'operation', TG_OP,
        'timestamp', now(),
        'system', 'checkout_rls_trigger',
        'table', TG_TABLE_NAME,
        'user_agent', current_setting('app.user_agent', true),
        'ip_address', current_setting('app.ip_address', true),
        'actor_kind', app.current_actor_kind()
    );

    -- Add order-specific business context
    IF TG_OP = 'UPDATE' THEN
        -- Get status information for business context
        SELECT isModifiable, isTerminal, allowsAddressUpdates
        INTO order_status_record
        FROM order_status WHERE code = NEW.status;

        IF FOUND THEN
            audit_metadata := audit_metadata || jsonb_build_object(
                'status_modifiable', order_status_record.isModifiable,
                'status_terminal', order_status_record.isTerminal,
                'allows_address_updates', order_status_record.allowsAddressUpdates
            );
        END IF;

        -- Add order financial context for compliance
        audit_metadata := audit_metadata || jsonb_build_object(
            'order_total', NEW.totalAmount,
            'order_item_count', (SELECT COUNT(*) FROM order_items WHERE orderId = NEW.id),
            'order_currency', NEW.currency
        );
    END IF;

    -- Merge application-provided metadata if available
    IF current_setting('app.audit_metadata', true) IS NOT NULL THEN
        audit_metadata := audit_metadata ||
            COALESCE(current_setting('app.audit_metadata', true)::jsonb, '{}'::jsonb);
    END IF;

    -- Insert comprehensive history record
    INSERT INTO order_status_history (
        orderId,
        tenantId,
        previousStatus,
        newStatus,
        changedBy,
        actorType,
        reason,
        changedAt
    ) VALUES (
        NEW.id,
        NEW.tenantId,
        CASE TG_OP WHEN 'UPDATE' THEN OLD.status ELSE NULL END,
        NEW.status,
        audit_initiated_by,
        app.current_actor_kind(),
        audit_reason,
        now()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for order status changes
CREATE TRIGGER order_status_history_trigger
AFTER INSERT OR UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION create_order_status_history();

-- =============================================================================
-- ENHANCED SESSION VARIABLE SETTING FUNCTIONS
-- =============================================================================

-- Function to set checkout audit context with validation
CREATE OR REPLACE FUNCTION set_checkout_audit_context(
    p_reason TEXT,
    p_metadata JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- Validate reason is not empty
    IF p_reason IS NULL OR trim(p_reason) = '' THEN
        RAISE EXCEPTION 'Audit reason cannot be empty';
    END IF;

    PERFORM set_config('app.audit_reason', p_reason, true);
    IF p_metadata IS NOT NULL THEN
        PERFORM set_config('app.audit_metadata', p_metadata::text, true);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clear checkout audit context
CREATE OR REPLACE FUNCTION clear_checkout_audit_context()
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.audit_reason', NULL, true);
    PERFORM set_config('app.audit_metadata', NULL, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- PLATFORM SUPERVISORY POLICY ENHANCEMENTS
-- =============================================================================

-- Enhanced platform supervisor access with analytics support
DROP POLICY IF EXISTS cart_platform_supervisor ON carts;
CREATE POLICY cart_platform_supervisor ON carts
FOR SELECT
USING (app.current_actor_kind() = 'platform');

DROP POLICY IF EXISTS order_platform_supervisor ON orders;
CREATE POLICY order_platform_supervisor ON orders
FOR SELECT
USING (app.current_actor_kind() = 'platform');

-- Platform supervisor access to all history for compliance and analytics
DROP POLICY IF EXISTS cart_status_history_platform ON cart_status_history;
CREATE POLICY cart_status_history_platform ON cart_status_history
FOR SELECT
USING (app.current_actor_kind() = 'platform');

DROP POLICY IF EXISTS order_status_history_platform ON order_status_history;
CREATE POLICY order_status_history_platform ON order_status_history
FOR SELECT
USING (app.current_actor_kind() = 'platform');

-- =============================================================================
-- BUSINESS CONSTRAINT VALIDATIONS (Application-Level Enforcement)
-- =============================================================================

-- Function to validate cart status transitions
CREATE OR REPLACE FUNCTION validate_cart_status_transition(
    p_cart_id TEXT,
    p_new_status TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    current_status TEXT;
    status_info RECORD;
BEGIN
    -- Get current cart status
    SELECT status INTO current_status FROM carts WHERE id = p_cart_id;

    -- Get new status information
    SELECT isModifiable, isConvertible, isDeleted
    INTO status_info
    FROM cart_status WHERE code = p_new_status;

    -- Validate transition rules
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid cart status: %', p_new_status;
    END IF;

    -- Cannot modify non-modifiable carts
    IF current_status IS NOT NULL AND NOT status_info.isModifiable THEN
        RAISE EXCEPTION 'Cannot modify cart in status: %', current_status;
    END IF;

    -- Cannot convert non-convertible carts
    IF p_new_status = 'converted' AND NOT status_info.isConvertible THEN
        RAISE EXCEPTION 'Cannot convert cart in current status';
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate order status transitions
CREATE OR REPLACE FUNCTION validate_order_status_transition(
    p_order_id TEXT,
    p_new_status TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    current_status TEXT;
    status_info RECORD;
BEGIN
    -- Get current order status
    SELECT status INTO current_status FROM orders WHERE id = p_order_id;

    -- Get new status information
    SELECT isModifiable, isTerminal
    INTO status_info
    FROM order_status WHERE code = p_new_status;

    -- Validate transition rules
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid order status: %', p_new_status;
    END IF;

    -- Cannot modify terminal orders
    IF current_status IS NOT NULL THEN
        SELECT isTerminal INTO status_info FROM order_status WHERE code = current_status;
        IF status_info.isTerminal AND p_new_status != 'failed' THEN
            RAISE EXCEPTION 'Cannot modify terminal order in status: %', current_status;
        END IF;
    END IF;

    -- Cannot modify non-modifiable orders
    SELECT isModifiable INTO status_info FROM order_status WHERE code = p_new_status;
    IF NOT status_info.isModifiable THEN
        RAISE EXCEPTION 'Cannot transition to non-modifiable status: %', p_new_status;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
