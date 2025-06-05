import express from 'express';
import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
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
import { socketConfig } from './config/socketConfig';

export const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO with type-safe configuration
export const io = new SocketIOServer(httpServer, socketConfig);

// Socket.IO connection handler with type safety
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('subscribe_inventory', (productId: string) => {
    socket.join(`inventory:${productId}`);
    console.log(`Client ${socket.id} subscribed to inventory:${productId}`);
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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
app.use('/api/inventory/alerts', apiKeyAuth, inventoryRoutes);
app.use('/api/audit', apiKeyAuth, auditRoutes);
app.use('/api/notifications', apiKeyAuth, notificationRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler should be last
app.use(errorHandler);