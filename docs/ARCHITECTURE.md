# Backend Architecture Documentation

## Deployment Architecture
```
[PMS (Vercel)] ←→ [Backend API (Render)] ←→ [Storefront (Vercel)]
       ↑                    ↑                         ↑
   Admin Panel        API Processing            Public Access
```

## System Overview
```
[PMS Frontend] ←→ [Backend API] ←→ [Database]
       ↑                ↑              ↑
   Admin Users     API Gateway    Data Storage
```

## Core Components
1. API Gateway
- Handles authentication/authorization
- Routes requests to appropriate services
- Rate limiting and request validation

2. Product Service
- Product CRUD operations
- Image handling
- Product status management (draft/published)
- Category management

3. Inventory Service
- Stock management
- Stock movement tracking
- Low stock alerts
- Inventory sync with storefront

4. Database Layer
- Products table
- Categories table
- Inventory table
- Order management

## Security Implementation
1. API Authentication
- API key validation
- Request origin validation
- CORS configuration

2. Data Validation
- Input sanitization
- Schema validation
- Image validation

3. Error Handling
- Standardized error responses
- Error logging
- Request tracking

## Deployment Considerations
1. Backend (Render)
   - Node.js runtime
   - API gateway
   - Service orchestration

2. Frontend (Vercel)
   - PMS: Admin interface
   - Storefront: Customer interface
   - Static/serverless deployment
