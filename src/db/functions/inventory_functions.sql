-- Stock Level Management
CREATE OR REPLACE FUNCTION check_reorder_point()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if stock is below reorder point
    IF NEW.stock <= NEW.minimum_stock THEN
        -- Create automatic reorder
        INSERT INTO purchase_orders (
            supplier_id,
            status,
            total_amount,
            notes
        ) SELECT
            p.default_supplier_id,
            'pending',
            p.reorder_quantity * p.unit_cost,
            'Auto-generated reorder'
        FROM products p
        WHERE p.id = NEW.product_id
        AND p.default_supplier_id IS NOT NULL
        RETURNING id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Multi-location Stock Management
CREATE OR REPLACE FUNCTION update_total_stock()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE inventory
    SET stock = (
        SELECT SUM(quantity)
        FROM location_inventory
        WHERE product_id = NEW.product_id
    )
    WHERE product_id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
