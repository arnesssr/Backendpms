-- Product Inventory Initialization Trigger
CREATE OR REPLACE FUNCTION initialize_product_inventory()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO inventory (
        product_id,
        stock,
        reserved,
        minimum_stock,
        status
    ) VALUES (
        NEW.id,
        0,
        0,
        5,
        'out_of_stock'
    );

    -- Create initial audit log
    INSERT INTO audit_logs (
        event_type,
        details,
        severity,
        metadata
    ) VALUES (
        'product.created',
        format('Product %s initialized with inventory', NEW.name),
        'info',
        jsonb_build_object(
            'product_id', NEW.id,
            'initial_stock', 0
        )
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_inventory_exists
    AFTER INSERT ON products
    FOR EACH ROW
    EXECUTE FUNCTION initialize_product_inventory();

-- Stock Movement Validation Trigger
CREATE OR REPLACE FUNCTION validate_stock_movement()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.quantity < 0 AND ABS(NEW.quantity) > (
        SELECT stock FROM inventory WHERE product_id = NEW.product_id
    ) THEN
        RAISE EXCEPTION 'Insufficient stock for product %', NEW.product_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_stock_movement
    BEFORE INSERT ON stock_movements
    FOR EACH ROW
    EXECUTE FUNCTION validate_stock_movement();
