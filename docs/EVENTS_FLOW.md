# Events Flow Documentation

## Event System Architecture
```
                                        ┌─────────────────┐
                                        │   API Request   │
                                        └────────┬────────┘
                                                │
                                        ┌───────▼────────┐
┌─────────────┐                        │                │         ┌─────────────┐
│   Redis     │◀───────────────────────┤  Event Emitter ├─────────▶ WebSocket  │
│   Pub/Sub   │                        │                │         │  Clients    │
└─────┬───────┘                        └───────┬────────┘         └─────────────┘
      │                                        │
      │                                ┌───────▼────────┐
      │                                │   Event Bus    │
      │                                └───────┬────────┘
      │                                        │
      │                    ┌──────────────────┬┴──────────────────┐
┌─────▼───────┐    ┌──────▼───────┐   ┌──────▼───────┐   ┌───────▼──────┐
│             │    │              │   │              │   │              │
│  Products   │    │  Inventory   │   │    Cache     │   │   Metrics    │
│  Handler    │    │   Handler    │   │   Handler    │   │   Handler    │
│             │    │              │   │              │   │              │
└─────┬───────┘    └──────┬───────┘   └──────┬───────┘   └───────┬──────┘
      │                   │                   │                    │
      │                   │                   │                    │
┌─────▼───────┐    ┌─────▼────────┐   ┌─────▼────────┐    ┌─────▼──────┐
│  Supabase   │    │    Redis     │   │   Supabase   │    │   Redis    │
│  Products   │    │ Inventory    │   │    Cache     │    │  Metrics   │
└─────────────┘    └─────────────┘    └─────────────┘     └────────────┘
```

## PMS Events

### Product Events
```
1. Product Creation
   Request → validateProduct → createProduct → emitEvent('product.created') → 
   → updateCache → notifyWebSocket → Response

2. Product Update
   Request → validateProduct → findProduct → updateProduct → emitEvent('product.updated') →
   → invalidateCache → notifyWebSocket → Response

3. Product Publication
   Request → validateProduct → publishProduct → emitEvent('product.published') →
   → syncWithPMS → updateCache → notifyWebSocket → Response
```

### Inventory Events
```
1. Stock Adjustment
   Request → validateAdjustment → updateStock → emitEvent('inventory.updated') →
   → updateCache → notifyWebSocket → Response

2. Low Stock Alert
   StockCheck → checkThreshold → emitEvent('inventory.alert') →
   → notifyAdmin → updateMetrics → Response

3. Stock Sync
   PMSWebhook → validateSync → syncStock → emitEvent('inventory.synced') →
   → updateCache → notifyWebSocket → Response
```

### Cache Events
```
1. Cache Miss
   Request → checkCache → emitEvent('cache.miss') → 
   → fetchFromDB → updateCache → Response

2. Cache Invalidation
   Update → invalidateKey → emitEvent('cache.invalid') →
   → clearRelated → updateMetrics → Response

3. Cache Warmup
   Startup → loadCommonData → emitEvent('cache.warm') →
   → updateMetrics → Response
```

### Error Events
```
1. Validation Error
   Request → validate → emitEvent('error.validation') →
   → logError → formatResponse → Response

2. Integration Error
   PMSRequest → processRequest → emitEvent('error.integration') →
   → retryQueue → notifyAdmin → Response

3. System Error
   Operation → handleError → emitEvent('error.system') →
   → logError → alertAdmin → Response
```

### WebSocket Events
```
1. Client Connection
   Connect → authenticate → emitEvent('ws.connect') →
   → setupListeners → Response

2. Real-time Update
   DataChange → preparePayload → emitEvent('ws.update') →
   → broadcastToClients → Response

3. Connection Error
   Error → handleWSError → emitEvent('ws.error') →
   → reconnect → Response
```

### Queue Events
```
1. Job Creation
   Request → createJob → emitEvent('queue.new') →
   → addToQueue → Response

2. Job Processing
   Worker → processJob → emitEvent('queue.processing') →
   → updateStatus → Response

3. Job Completion
   Worker → completeJob → emitEvent('queue.complete') →
   → cleanupResources → Response
```

### Metrics Events
```
1. API Request
   Request → measureLatency → emitEvent('metrics.request') →
   → updateStats → Response

2. Error Rate
   Error → calculateRate → emitEvent('metrics.error') →
   → updateDashboard → Response

3. Resource Usage
   Monitor → checkResources → emitEvent('metrics.resources') →
   → updateMetrics → Response
```

## Event Handlers Location

```
src/
└── events/
    ├── handlers/
    │   ├── product.ts     # Product event handlers
    │   ├── inventory.ts   # Inventory event handlers
    │   ├── error.ts       # Error event handlers
    │   └── metrics.ts     # Metrics event handlers
    └── index.ts          # Event registration
```

## Event Message Structure

```typescript
interface EventMessage {
  type: string;          // Event type (e.g., 'product.created')
  payload: unknown;      // Event data
  metadata: {
    timestamp: string;   // Event timestamp
    actor: string;      // Event initiator
    traceId: string;    // For event tracing
  }
}
```

## Event Processing Flow

```
Event Emitted →
  │
  ├─► Log Event
  │
  ├─► Process Event
  │     │
  │     ├─► Primary Handler
  │     ├─► Secondary Handlers
  │     └─► Cleanup Tasks
  │
  ├─► Update Metrics
  │
  └─► Send Notifications
```
