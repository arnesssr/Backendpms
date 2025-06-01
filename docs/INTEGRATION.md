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
