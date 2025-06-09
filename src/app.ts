import express from 'express';
import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { db, dbConnect } from './config/database';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import orderRoutes from './routes/orderRoutes';
import pmsRoutes from './routes/pmsRoutes';
import webhookRoutes from './routes/webhookRoutes';
import { apiKeyAuth } from './middleware/apiKeyAuth';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import testRoutes from './routes/testRoutes';
import auditRoutes from './routes/auditRoutes';
import notificationRoutes from './routes/notificationRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import { socketConfig } from './config/socketConfig';
import { HealthcheckService } from './services/healthcheckService';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import timeout from 'connect-timeout';

export const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO with type-safe configuration
export const io = new Server(httpServer, socketConfig);

// Socket.IO connection handler with type safety
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Add error handling
  socket.on('error', (error) => {
    console.error('Socket error:', error);
    socket.emit('error', { message: 'Internal WebSocket error' });
  });

  socket.on('subscribe_inventory', (productId: string) => {
    try {
      socket.join(`inventory:${productId}`);
      console.log(`Client ${socket.id} subscribed to inventory:${productId}`);
    } catch (error) {
      socket.emit('subscription_error', { productId, error: 'Failed to subscribe' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Add request logging middleware before other middleware
app.use((req, res, next) => {
  console.log('\n🔄 Request Details:');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Method: ${req.method}`);
  console.log(`URL: ${req.url}`);
  console.log(`Origin: ${req.headers.origin}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Middleware
app.use(cors({
  origin: [
    process.env.PMS_URL || 'http://localhost:5173',
    process.env.STOREFRONT_URL || 'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-API-Key',
    'X-Request-Signature',
    'X-Request-Timestamp',
    'X-Request-Nonce'
  ],
  maxAge: 600 // Cache preflight requests for 10 minutes
}));

// Add timeout middleware
app.use(timeout('30s'));
app.use((req, res, next) => {
  if (!req.timedout) next();
});

// Add rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// Add compression
app.use(compression());

// Add request size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(requestLogger);

// Add root route handler before other routes
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend PMS API',
    docs: '/api/docs',
    health: '/health'
  });
});

// Test routes should be first and properly mounted
app.use('/api/test', testRoutes);

// Protected routes
app.use('/api/pms', apiKeyAuth, pmsRoutes);
app.use('/api/products', apiKeyAuth, productRoutes);
app.use('/api/categories', apiKeyAuth, categoryRoutes);
app.use('/api/orders', apiKeyAuth, orderRoutes);
app.use('/api/inventory', apiKeyAuth, inventoryRoutes);
app.use('/api/analytics', apiKeyAuth, analyticsRoutes);
app.use('/api/audit', apiKeyAuth, auditRoutes);
app.use('/api/notifications', apiKeyAuth, notificationRoutes);
app.use('/api/webhooks', apiKeyAuth, webhookRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  const healthcheck = await HealthcheckService.getInstance().checkSystem();
  res.json({
    status: healthcheck.database.healthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    checks: healthcheck
  });
});

// Error handler should be last
app.use(errorHandler);