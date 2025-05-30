---
applyTo: 'Backendpms'
---

this is a backend that serves both pms and storefront
Coding standards, domain knowledge, and preferences that AI should follow.
use the most recent backend design tecniques to design secure , scalable and maintainable backend system.

current situaltion: 
Current Backend Status:

Database Setup ✅
PostgreSQL setup with Supabase
Schema defined in schema.sql
Database connection config in place
Tables created for:
Products
Categories
Inventory
Orders
Stock movements
Suppliers
Audit logs
API Routes Setup ✅
Product routes
Category routes
Inventory routes
Order routes
PMS routes
Test routes
Authentication & Security ✅
API key authentication middleware
CORS configuration
Error handling middleware
Request logging
Testing Infrastructure ✅
Integration tests for:
Product API
Category API
Inventory API
Order API
Database connections
Areas Needing Attention:

Test Failures 🚨
Product integration tests failing
Database test setup issues
Mock data inconsistencies
Service Layer Issues 🚨
Product publish service needs completion
Inventory synchronization incomplete
Real-time updates not fully implemented
Error Handling Gaps 🚨
Some routes missing proper error responses
Validation middleware not consistently applied
Transaction rollbacks not fully implemented
Missing Features 🚨
Batch operations for product updates
Webhook handlers for storefront sync
Complete audit logging implementation