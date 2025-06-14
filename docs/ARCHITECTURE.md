# Backend Architecture Documentation

## System Architecture Flow

```
┌─────────────────┐     ┌──────────────┐     ┌───────────────┐
│  PMS Frontend   │────▶│  API Routes  │────▶│  Middleware   │
└─────────────────┘     └──────────────┘     └───────────────┘
                                                     │
┌─────────────────┐     ┌──────────────┐           ▼
│    Redis Cache  │◀───▶│  Controllers │◀────┐ Validation
└─────────────────┘     └──────────────┘     │     │
                              │              │     ▼
┌─────────────────┐          ▼              │ Services
│    Supabase     │◀────┐ Models           │     │
└─────────────────┘     │    │             │     ▼
                        └────┼──────────────┘ Response
                             ▼
                        Event System
```

## Component Relationships

### 1. Configuration Layer (/config)
- database.ts: Supabase connection
- redis.ts: Redis client setup
- socket.ts: WebSocket configuration
- cors.ts: CORS settings
- rateLimit.ts: Rate limiting rules

### 2. Route Layer (/routes)
```
routes/
├── pms/              # PMS integration routes
│   ├── products.ts   # Product management
│   ├── inventory.ts  # Stock management
│   └── webhook.ts    # Event handling
├── products.ts       # Core product routes
├── inventory.ts      # Core inventory routes
└── webhooks.ts       # General webhooks
```

### 3. Middleware Layer (/middleware)
```
middleware/
├── auth/
│   ├── apiKey.ts    # API key validation
│   └── jwt.ts       # JWT handling
├── validation.ts    # Request validation
├── rateLimit.ts    # Rate limiting
└── error.ts        # Error handling
```

### 4. Service Layer (/services)
```
services/
├── pms/
│   ├── sync.ts      # PMS synchronization
│   ├── events.ts    # PMS event handling
│   └── publish.ts   # Publishing logic
├── product.ts       # Product operations
├── inventory.ts     # Inventory management
└── storage.ts       # File storage
```

### 5. Model Layer (/models)
```
models/
├── pms/
│   ├── Product.ts   # PMS product model
│   └── Event.ts     # PMS event model
├── Product.ts       # Core product model
└── Inventory.ts     # Core inventory model
```

### 6. Validation Layer (/validators)
```
validators/
├── pms/
│   ├── product.ts   # PMS data validation
│   └── webhook.ts   # Webhook validation
└── common/
    └── schema.ts    # Shared schemas
```

### 7. Type Definitions (/types)
```
types/
├── pms.ts          # PMS related types
├── product.ts      # Product types
└── common.ts       # Shared types
```

## Data Flow Examples

### 1. Product Creation Flow
```
Request → API Route → Auth Middleware → Validation →
Service → Model → Database → Event → Response
```

### 2. PMS Sync Flow
```
PMS Webhook → Webhook Route → Validation →
Sync Service → Model → Database → Event → Response
```

### 3. Cache Flow
```
Request → Route → Cache Check →
(Cache Hit) → Response
(Cache Miss) → Service → Database → Cache Update → Response
```

## Integration Points

1. External Systems
   - PMS Frontend (API)
   - Supabase (Database)
   - Redis (Cache/Queue)
   - CloudStorage (Files)

2. Internal Systems
   - Event System
   - WebSocket Server
   - Job Queue
   - Cache Layer

## Security Layer

1. Request Flow
```
Request →
  Rate Limit Check →
  API Key Validation →
  Request Validation →
  Business Logic →
Response
```

2. Data Protection
   - API Key Authentication
   - Request Signing
   - Data Validation
   - Error Handling

## Monitoring & Logging

1. System Health
   - Database Connectivity
   - Redis Status
   - API Response Times
   - Error Rates

2. Business Metrics
   - Request Volume
   - Cache Hit Rates
   - Sync Success Rates
   - Error Distribution

## Error Handling Strategy

1. Layer-Specific Handling
   - Route Level: Request/Response errors
   - Service Level: Business logic errors
   - Model Level: Data persistence errors
   - Integration Level: External system errors

2. Error Flow
```
Error Detected →
  Log Error →
  Format Error →
  Send Response →
  (If Critical) Alert
```
