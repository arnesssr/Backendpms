# PMS Validators

## Purpose
These validators ensure data integrity between PMS and our backend by validating incoming data against expected schemas.

## Validator Types

1. `productValidator.ts`
   - Validates incoming PMS product data
   - Ensures required fields exist
   - Type checks (string, number, etc)
   - Format validation (UUID, URLs, etc)

2. `inventoryValidator.ts`
   - Validates stock adjustments
   - Ensures valid quantities
   - Validates adjustment reasons
   - Type safety for operations

3. `webhookValidator.ts` (Missing - Need to Create)
   - Validates webhook payloads
   - Verifies event types
   - Ensures event data structure

4. `imageValidator.ts` 
   - Validates image uploads
   - Checks file types
   - Size limitations
   - Format requirements

## Usage Example
```typescript
import { validateProduct } from './productValidator';

// In route handler:
const validation = validateProduct(req.body);
if (!validation.success) {
  throw new Error(`Invalid product data: ${validation.error}`);
}
```

## Integration Points
- Used in PMS routes before processing
- Integrated with error handling
- Provides type safety
- Ensures data consistency
