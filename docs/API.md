# API Documentation

## Authentication
All protected routes require:
- X-API-Key header
- User session (pending)

## WebSocket Events
```typescript
interface WebSocketEvents {
  'subscribe_inventory': (productId: string) => void;
  'inventory_update': (data: InventoryUpdate) => void;
  'connection_error': (error: Error) => void;
}
```

## REST Endpoints

### Products API
- POST /api/products
- PUT /api/products/:id
- POST /api/products/:id/publish

### Inventory API
- GET /api/inventory/stock/:id
- POST /api/inventory/adjust
- GET /api/inventory/alerts

### Audit API
- GET /api/audit/logs
- POST /api/audit/track
