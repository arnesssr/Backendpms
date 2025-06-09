# Backend Architecture Documentation

# System Architecture

## Current Implementation
```mermaid
graph TB
    Client[Client Applications] --> Auth[Authentication Layer]
    Auth --> API[API Layer]
    API --> Services[Service Layer]
    Services --> DB[(Database)]
    
    WebSocket[WebSocket Server] --> EventHandler[Event Handler]
    EventHandler --> Services
```

## Required Components

### 1. Event System
- Event Bus
- Message Queue
- Real-time Updates

### 2. Data Flow
- Validation Layer
- Transaction Management
- Cache Layer

### 3. Integration Points
- Webhook System
- External Services
- Monitoring System

## Security Architecture
- Authentication Flow
- Authorization Rules
- Data Protection
- Data Encryption:
  - AES-256-GCM for sensitive data
  - TLS 1.3 for data in transit
  - End-to-end encryption for WebSocket
  - Encrypted webhooks

```mermaid
graph TB
    subgraph "Security Layer"
        API_KEY[API Key Auth]
        CORS[CORS Policy]
        RATE[Rate Limiting]
        VAL[Input Validation]
        ENC[Encryption Layer]
    end

    ENC --> API_KEY
    ENC --> WebSocket
    ENC --> Webhooks
```

## Complete System Architecture
```mermaid
graph TB
    subgraph "Frontend Layer"
        PMS["PMS Admin Interface<br/>(Vercel)"]
        SF["Storefront<br/>(Vercel)"]
    end

    subgraph "API Layer"
        API["Backend API<br/>(Render)"]
        AUTH["Authentication<br/>Service"]
        GATE["API Gateway"]
    end

    subgraph "Service Layer"
        PROD["Product Service"]
        CAT["Category Service"]
        INV["Inventory Service"]
        ORD["Order Service"]
        SET["Settings Service"]
        AUD["Audit Service"]
    end

    subgraph "Database Layer"
        DB[(Supabase<br/>PostgreSQL)]
        CACHE["Redis Cache"]
    end

    %% Frontend to API Connections
    PMS -->|"Admin API Calls"| GATE
    SF -->|"Public API Calls"| GATE

    %% Gateway & Auth
    GATE -->|"Validate"| AUTH
    GATE -->|"Route"| API

    %% API to Service Connections
    API -->|"Product Operations"| PROD
    API -->|"Category Management"| CAT
    API -->|"Inventory Control"| INV
    API -->|"Order Processing"| ORD
    API -->|"System Settings"| SET
    API -->|"Audit Logging"| AUD

    %% Service to Database Connections
    PROD -->|"CRUD"| DB
    CAT -->|"CRUD"| DB
    INV -->|"CRUD"| DB
    ORD -->|"CRUD"| DB
    SET -->|"CRUD"| DB
    AUD -->|"Write"| DB

    %% Cache Connections
    PROD -.->|"Cache"| CACHE
    CAT -.->|"Cache"| CACHE
    INV -.->|"Cache"| CACHE
```

## Module Interactions

### Product Publishing Flow
```mermaid
sequenceDiagram
    participant PMS
    participant API
    participant DB
    participant SF

    PMS->>API: Publish Product
    API->>DB: Update Status
    API->>DB: Log Audit
    API-->>SF: Webhook Notification
    SF->>API: Fetch Updated Product
    API->>DB: Get Product Data
    API-->>SF: Product Details
```

### Order Processing Flow
```mermaid
sequenceDiagram
    participant SF
    participant API
    participant INV
    participant DB
    participant PMS

    SF->>API: Create Order
    API->>DB: Validate Stock
    API->>INV: Reserve Stock
    INV->>DB: Update Inventory
    API->>DB: Create Order
    API-->>PMS: Order Notification
    PMS->>API: Process Order
    API->>DB: Update Status
    API-->>SF: Order Confirmation
```

### Inventory Management Flow
```mermaid
sequenceDiagram
    participant PMS
    participant API
    participant INV
    participant DB
    participant SF

    PMS->>API: Update Stock
    API->>INV: Validate Change
    INV->>DB: Record Movement
    INV->>DB: Update Stock
    API-->>SF: Stock Update
    SF->>API: Get Stock Level
    API->>DB: Check Stock
    API-->>SF: Stock Status
```

## Data Flow Architecture

### Database Schema Relationships
```mermaid
erDiagram
    PRODUCTS ||--o{ INVENTORY_MOVEMENTS : has
    PRODUCTS ||--o{ ORDER_ITEMS : contains
    CATEGORIES ||--o{ PRODUCTS : categorizes
    ORDERS ||--|{ ORDER_ITEMS : includes
    AUDIT_LOGS ||--o{ PRODUCTS : tracks
    SETTINGS }|--|{ PRODUCTS : configures
```

## State Transitions

### Product Status Flow
```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Published
    Published --> Archived
    Archived --> Draft
    Published --> Draft
```

### Order Status Flow
```mermaid
stateDiagram-v2
    [*] --> Pending
    Pending --> Processing
    Processing --> Completed
    Processing --> Cancelled
    Completed --> Refunded
```

## Security Architecture
```mermaid
graph TB
    subgraph "Security Layer"
        API_KEY[API Key Auth]
        CORS[CORS Policy]
        RATE[Rate Limiting]
        VAL[Input Validation]
        ENC[Encryption Layer]
    end

    ENC --> API_KEY
    ENC --> WebSocket
    ENC --> Webhooks
```

This architecture ensures:
1. Clear separation of concerns
2. Scalable microservices
3. Secure data flow
4. Reliable state management
5. Comprehensive monitoring

# Project Architecture

## Directory Structure
```
backendpms/
├── scripts/              # Global build & deployment scripts
│   ├── build.sh         # Production build script
│   └── start.sh         # Production startup script
│
├── src/
│   ├── scripts/         # Application-specific scripts
│   │   ├── generateApiKey.ts
│   │   └── seedDatabase.ts
│   │
│   ├── jobs/           # Scheduled jobs & background tasks
│   │   ├── inventoryCleanupJob.ts
│   │   └── metricCollectionJob.ts
│   │
│   └── services/       # Core business logic
│
├── tests/
│   ├── integration/    # Integration tests
│   ├── unit/          # Unit tests
│   └── e2e/           # End-to-end tests
│
└── scripts.md          # Documentation for all scripts
```

## Script Organization

### Global Scripts (./scripts/)
Located at project root, handles:
- Deployment procedures
- Build processes
- Environment setup
- Container management

Example:
```bash
./scripts/build.sh      # Production build
./scripts/start.sh      # Production startup
```

### Application Scripts (./src/scripts/)
Located in source code, handles:
- Data management
- Key generation
- Database operations
- Development utilities

Example:
```bash
pnpm exec ts-node src/scripts/generateApiKey.ts
pnpm exec ts-node src/scripts/seedDatabase.ts
```

### Test Scripts (./tests/)
Located in tests directory, handles:
- Test data setup
- Mock data generation
- Test environment configuration

Example:
```bash
pnpm test:setup        # Setup test environment
pnpm test:teardown     # Clean test environment
```

## Script Usage Guidelines

1. **Global Scripts**
   - Used by CI/CD pipelines
   - Handle deployment tasks
   - Manage production environment

2. **Application Scripts**
   - Used during development
   - Handle data operations
   - Generate development assets

3. **Test Scripts**
   - Used for testing
   - Handle test data
   - Manage test environment

## Best Practices
1. Global scripts should be in bash/shell
2. Application scripts should be in TypeScript
3. Test scripts should follow test framework conventions
4. All scripts should have error handling
5. Scripts should be documented in scripts.md

## Script Documentation
Each script should have:
- Purpose description
- Usage examples
- Required permissions
- Environment variables
- Expected outputs
