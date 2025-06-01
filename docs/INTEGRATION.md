# Integration Guide

## PMS Integration
1. Authentication:
```typescript
headers: {
  'X-API-Key': 'your_api_key',
  'Content-Type': 'application/json'
}
```

2. Product Creation:
```typescript
POST /api/products
{
  name: string
  description: string
  price: number
  category: string
  status: 'draft' | 'published'
  stock: number
}
```

3. Image Upload:
```typescript
POST /api/products/images
Content-Type: multipart/form-data
- images: File[]
```

## Storefront Integration
1. Product Retrieval:
```typescript
GET /api/products?status=published
```

2. Stock Updates:
```typescript
GET /api/inventory/:productId
```

## Error Handling
1. Standard Error Response:
```typescript
{
  error: string
  code: string
  details?: any
}
```

2. Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

# System Integration Documentation

## System Overview
```
[PMS (Vercel)] ←→ [Backend (Render)] ←→ [Storefront (Vercel)]
       ↑                   ↑                      ↑
Admin Interface     API Processing         Customer Interface
```

## Deployment Structure
```
1. PMS Frontend
   - Deployed: Vercel
   - Environment: Production
   - Access: Admin only

2. Backend API
   - Deployed: Render
   - Environment: Production
   - Access: Authenticated requests

3. Storefront
   - Deployed: Vercel
   - Environment: Production
   - Access: Public
```

## Integration Flows

### Development Environment
```
Local Development → Production Backend
- PMS: localhost:5173 → Render backend
- Testing: localhost:5000 → Render backend
```

### Production Environment
```
Vercel (PMS) → Render (Backend) → Vercel (Storefront)
```

## API Authentication
```typescript
headers: {
  'X-API-Key': process.env.API_KEY,
  'Content-Type': 'application/json'
}
```

## 1. PMS to Backend Integration

### Authentication Flow
```
PMS (5173) → Backend API
   |
   ├── Headers:
   │   'X-API-Key': process.env.API_KEY
   │   'Content-Type': 'application/json'
   │
   └── Endpoints: /api/pms/*
```

### Product Management Flow
```
1. Create Product (Draft)
   POST /api/products
   └── Backend → Database (draft status)

2. Upload Images
   POST /api/products/images
   └── Backend → Image Storage

3. Publish Product
   POST /api/products/{id}/publish
   └── Backend → Update Status → Sync to Storefront
```

### Inventory Management Flow
```
PMS → Backend → Database
 |
 ├── Update Stock
 │   PUT /api/inventory/{id}
 │
 └── Track Movement
     POST /api/inventory/movement
```

## 2. Backend to Storefront Integration

### Product Sync Flow
```
Backend → Storefront
   |
   ├── Published Products
   │   GET /api/products?status=published
   │
   └── Real-time Updates
       WebSocket: product_updates
```

### Stock Management Flow
```
Backend ←→ Storefront
   |
   ├── Check Stock
   │   GET /api/inventory/{id}/available
   │
   └── Reserve Stock
       POST /api/inventory/{id}/reserve
```

## 3. API Endpoints Reference

### PMS Endpoints
```typescript
// Product Management
POST   /api/products              // Create product
PUT    /api/products/{id}        // Update product
DELETE /api/products/{id}        // Delete product
POST   /api/products/{id}/publish // Publish product

// Inventory Management
GET    /api/inventory/{id}       // Get stock
PUT    /api/inventory/{id}       // Update stock
POST   /api/inventory/movement   // Record movement
```

### Storefront Endpoints
```typescript
// Product Display
GET /api/products?status=published  // Get published products
GET /api/products/{id}             // Get single product

// Stock Operations
GET  /api/inventory/{id}/available  // Check availability
POST /api/inventory/{id}/reserve    // Reserve stock
```

## 4. Error Handling

### Standard Response Format
```typescript
{
  success: boolean
  data?: any
  error?: {
    code: string
    message: string
    details?: any
  }
}
```

### Common Error Scenarios
1. Authentication Failures
```typescript
Status: 401
{
  success: false,
  error: {
    code: 'AUTH_FAILED',
    message: 'Invalid API key'
  }
}
```

2. Operation Failures
```typescript
Status: 400-500
{
  success: false,
  error: {
    code: 'OPERATION_FAILED',
    message: 'Specific error message',
    details: { ... }
  }
}
```

## 5. Testing Integration

### Local Testing
```bash
# Test from local PMS to production backend
curl -H "X-API-Key: your_api_key" \
     -H "Origin: http://localhost:5173" \
     BACKEND_URL/health

# Test product creation
curl -X POST \
     -H "X-API-Key: your_api_key" \
     -H "Content-Type: application/json" \
     -d '{"name":"Test Product","price":99.99}' \
     BACKEND_URL/api/products
```

### Production Testing
```bash
# Using environment variables
BACKEND_URL="[Your-Render-Backend-URL]"
PMS_URL="[Your-Vercel-PMS-URL]"
STOREFRONT_URL="[Your-Vercel-Storefront-URL]"
```
