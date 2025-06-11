# Backend PMS (Product Management System)

A robust, real-time enabled backend service for product management and inventory control.

## Documentation Quick Links
- [Architecture](./docs/ARCHITECTURE.md)
- [API Documentation](./docs/API.md)
- [Events Flow](./docs/EVENTS_FLOW.md)
- [Security](./docs/SECURITY.md)
- [Integration](./docs/INTEGRATION.md)
- [Todo List](./docs/TODO.md)

## System Overview
Backend PMS provides:
- Real-time inventory management with WebSocket integration
- Distributed caching with Redis
- Event-driven architecture for scalability
- Comprehensive health monitoring
- Automated background jobs
- Type-safe API endpoints

### Core Systems
1. **Product Management**
   - Publishing workflow
   - Version control
   - Asset management

2. **Inventory Control**
   - Real-time stock updates
   - Reservation system
   - Low stock alerts

3. **Order Processing**
   - State machine workflow
   - Inventory validation
   - Webhook notifications

4. **Integration Points**
   - WebSocket events
   - REST APIs
   - Webhook system
   - Background jobs

## Features
- ✅ Real-time inventory tracking
- ✅ Product management
- ✅ WebSocket integration
- ✅ Audit logging
- ✅ Automated notifications
- ✅ API key authentication

## Tech Stack
- Node.js & Express
- TypeScript
- Socket.IO
- PostgreSQL (Supabase)
- Clerk Authentication

## Getting Started

### Prerequisites
```bash
node >= 18
pnpm >= 8
```

### Environment Setup
1. Clone repository
2. Copy environment variables:
```bash
cp .env.example .env
```

3. Install dependencies:
```bash
pnpm install
```

4. Start development server:
```bash
pnpm dev
```

### Environment Variables
See [Environment Configuration](./docs/DEPLOYMENT.md#environment-variables) for details.

## API Routes

### PMS Integration
```typescript
POST /api/pms/products/create       // Create product
PUT /api/pms/products/:id/publish   // Publish product
GET /api/pms/inventory/alerts       // Stock alerts
```

### WebSocket Events
```typescript
socket.on('subscribe_inventory', (productId: string))
socket.on('inventory_update', (data: InventoryUpdate))
```

Full API documentation available in [API.md](./docs/API.md)

## Development

### Available Scripts
```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm test         # Run tests
```

### Testing
See [Testing Documentation](./docs/TESTING.md) for details on:
- Unit tests
- Integration tests
- WebSocket testing

## Deployment
Production deployment instructions available in [Deployment Guide](./docs/DEPLOYMENT.md)

### Supported Platforms
- ✅ Render
- ✅ Railway
- ✅ DigitalOcean
- ✅ Custom VPS

## Integration

### PMS Frontend
- Repository: [Inventra Frontend](https://github.com/arnesssr/Inventra---frontend)
- Documentation: [Integration Guide](./docs/INTEGRATION.md)

### Storefront
- Repository: [Storefront](https://github.com/arnesssr/storefront---inventra)
- Documentation: [Storefront Integration](./docs/STOREFRONT.md)

## Project Structure
```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Express middleware
├── routes/         # API routes
├── services/       # Business logic
├── types/         # TypeScript types
└── utils/         # Utility functions
```

## Contributing
1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## License
MIT License - see [LICENSE](./LICENSE) for details

## Support
- Documentation: [/docs](./docs)
- Issues: [GitHub Issues](https://github.com/arnesssr/backendpms/issues)
- Security: [SECURITY.md](./docs/SECURITY.md)
