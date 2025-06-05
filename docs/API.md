# Backend PMS API Documentation

## Authentication
All protected routes require API key in header:
```http
X-API-Key: your_api_key_here
```

## WebSocket Events
Connect to WebSocket:
```javascript
const socket = io('wss://backendpms-wvoo.onrender.com', {
  path: '/socket.io',
  auth: { token: 'your_api_key' }
});
```

### Events
```typescript
// Server -> Client Events
socket.on('inventory_update', (data: { productId: string, stock: number }) => {})
socket.on('order_status', (data: { orderId: string, status: string }) => {})
socket.on('system_alert', (data: { type: string, message: string }) => {})

// Client -> Server Events
socket.emit('subscribe_inventory', productId: string)
socket.emit('subscribe_order', orderId: string)
```

## REST Endpoints

### Products API
```typescript
// Create Product
POST /api/pms/products
Content-Type: application/json
{
  "name": string,
  "description": string,
  "price": number,
  "categoryId": string,
  "images": string[]
}

// Publish Product
PUT /api/pms/products/:id/publish
Content-Type: application/json
{
  "status": "published"
}

// Update Product
PATCH /api/pms/products/:id
Content-Type: application/json
{
  "name?": string,
  "price?": number
  // ...other fields
}
```

### Inventory API
```typescript
// Check Stock
GET /api/inventory/stock/:productId

// Adjust Stock
POST /api/inventory/adjust
Content-Type: application/json
{
  "productId": string,
  "quantity": number,
  "type": "increment" | "decrement"
}

// Get Low Stock Alerts
GET /api/inventory/alerts
```

### Orders API
```typescript
// Create Order
POST /api/pms/orders
Content-Type: application/json
{
  "items": Array<{
    "productId": string,
    "quantity": number
  }>,
  "customerId": string,
  "shippingAddress": string
}

// Update Order Status
PATCH /api/pms/orders/:id/status
Content-Type: application/json
{
  "status": "confirmed" | "processing" | "shipped" | "delivered"
}
```

### Analytics API
```typescript
// Get Sales Analytics
GET /api/analytics/sales
Query Params:
  startDate: YYYY-MM-DD
  endDate: YYYY-MM-DD
  groupBy: "day" | "week" | "month"

// Get Inventory Metrics
GET /api/analytics/inventory/metrics
```

### Health Check API
```typescript
// System Health
GET /health
Response:
{
  "status": "ok" | "degraded",
  "timestamp": string,
  "checks": {
    "database": { healthy: boolean, latency?: number },
    "memory": { healthy: boolean, usage: object },
    "websocket": { healthy: boolean, connections: number },
    "uptime": number
  }
}
```

## Cache Integration
Redis configuration (via Upstash):
```typescript
REDIS_URL=your_upstash_url
REDIS_TOKEN=your_upstash_token
```

## Rate Limits
```typescript
// Standard Limits
- 100 requests per minute for API endpoints
- 1000 WebSocket messages per minute
- 50 concurrent connections per client
```
