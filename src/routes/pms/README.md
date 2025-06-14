# PMS Integration Routes

## Purpose
These routes specifically handle integration with PMS (Product Management System) frontend. They are separate from main routes to maintain clear separation of concerns.

## Route Structure

### PMS Routes (`/api/pms/*`)
- Handle incoming requests FROM PMS frontend
- Use PMS-specific data validation
- Return responses in PMS expected format
- Include PMS-specific error handling

### Main Routes (`/api/*`)
- Handle our backend's core functionality
- Use our internal data validation
- Return responses in our standard format
- Use general error handling

## Key Differences

1. `/api/pms/products` vs `/api/products`
   - PMS: Handles product sync from PMS
   - Main: Handles our internal product management

2. `/api/pms/inventory` vs `/api/inventory`
   - PMS: Processes PMS inventory adjustments
   - Main: Manages our internal inventory system

3. `/api/pms/webhook` vs `/api/webhooks`
   - PMS: Receives PMS-specific events
   - Main: Handles general webhook notifications

## Data Flow
```
PMS Frontend → PMS Routes → Data Validation → Database → Event Emission
```

## Headers Required
- x-api-key: PMS API key
- x-request-timestamp: Request timestamp
- Content-Type: application/json
