CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL,
    data JSONB NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    retries INTEGER DEFAULT 0,
    last_error TEXT,
    delivery_status VARCHAR(50),
    signature VARCHAR(255)
);

CREATE INDEX idx_webhook_events_status ON webhook_events(status);
CREATE INDEX idx_webhook_events_timestamp ON webhook_events(timestamp);
CREATE INDEX idx_webhook_events_event_id ON webhook_events(event_id);
