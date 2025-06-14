-- Composite indexes for common queries
CREATE INDEX idx_inventory_stock_status ON inventory (product_id, stock) 
WHERE status = 'in_stock';

CREATE INDEX idx_products_category_status ON products (category, status) 
INCLUDE (name, price);

-- Partial indexes for active records
CREATE INDEX idx_active_products ON products (id, updated_at) 
WHERE status != 'deleted';

-- BRIN index for time-series data
CREATE INDEX idx_stock_movements_time ON stock_movements 
USING BRIN (created_at) WITH (pages_per_range = 32);

-- GiST index for inventory search
CREATE INDEX idx_inventory_search ON inventory 
USING gist (product_id, stock, status);
