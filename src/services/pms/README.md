# PMS Services

## Purpose
These services handle PMS-specific business logic and integration, separate from our main services.

## Key Differences

1. PMS Services vs Main Services:
- PMS: Handles external PMS system integration
- Main: Handles our core business logic

## Service Structure

1. eventEmitter.ts
   - Handles PMS-specific events
   - Manages event tracking
   - Different from main event system

2. persistence.ts
   - Manages PMS data persistence
   - Handles sync states
   - Separate from main data persistence

3. sync.ts (New)
   - Manages data synchronization with PMS
   - Handles version conflicts
   - PMS-specific sync logic

4. notification.ts (New)
   - PMS-specific notifications
   - Integration status alerts
   - Sync error notifications

5. validation.ts (New)
   - PMS data validation
   - Schema verification
   - Format conversion
