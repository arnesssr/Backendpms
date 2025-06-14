-- Location management
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    address TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Location inventory
CREATE TABLE IF NOT EXISTS location_inventory (
    location_id UUID REFERENCES locations(id),
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 0,
    minimum_stock INTEGER DEFAULT 5,
    maximum_stock INTEGER,
    reorder_point INTEGER,
    reorder_quantity INTEGER,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (location_id, product_id)
);

-- Stock movement tracking
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    location_id UUID REFERENCES locations(id),
    quantity INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    reference_type VARCHAR(50),
    reference_id UUID,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Add constraints
ALTER TABLE location_inventory 
    ADD CONSTRAINT positive_quantity CHECK (quantity >= 0),
    ADD CONSTRAINT valid_reorder_point CHECK (reorder_point <= maximum_stock),
    ADD CONSTRAINT valid_minimum_stock CHECK (minimum_stock <= maximum_stock);

-- Add indices
CREATE INDEX idx_location_inventory_stock ON location_inventory(product_id, quantity)
    WHERE quantity <= minimum_stock;
CREATE INDEX idx_stock_movements_date ON stock_movements(created_at);
