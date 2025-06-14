CREATE TABLE IF NOT EXISTS image_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    public_id VARCHAR(255) NOT NULL UNIQUE,
    metadata JSONB NOT NULL,
    version VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_image_metadata_public_id ON image_metadata(public_id);
CREATE INDEX idx_image_metadata_version ON image_metadata(version);
