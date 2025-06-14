# PMS Models

## Purpose
These models specifically handle PMS data structures and their transformation to our internal models. They act as an integration layer between PMS and our system.

## Model Differences

1. `PMSProduct` vs `Product`
   - PMSProduct:
     - Includes PMS-specific fields (pmsId, publishedAt)
     - Handles PMS product structure
     - Tracks sync status with PMS
   - Product (Main):
     - Our internal product representation
     - Core business logic fields
     - System-specific attributes

2. `InventoryMovement` vs `StockMovement`
   - InventoryMovement:
     - PMS stock adjustments
     - PMS-specific reason codes
     - Sync tracking
   - StockMovement (Main):
     - Internal inventory changes
     - Our business logic rules
     - Local stock management

3. `PMSEvent` (PMS-only)
   - Tracks PMS integration events
   - Handles synchronization status
   - Manages event retries
   - No equivalent in main models

## Data Flow Example
```
PMS Product Data → PMSProduct Model → Transform → Product Model → Database
```

## Key Features
1. Data Transformation
   - Convert PMS formats to internal formats
   - Handle field mapping
   - Validate PMS-specific requirements

2. Sync Management
   - Track sync status
   - Handle version conflicts
   - Manage update timestamps

3. Integration Logging
   - Track PMS operations
   - Monitor sync failures
   - Audit trail for changes

## Usage Context
- Used only in PMS integration routes
- Handle PMS data validation
- Manage PMS-specific business rules
- Bridge between systems
