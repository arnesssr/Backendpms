import express from 'express';
import cors from 'cors';
import { db, dbConnect } from './config/database';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import orderRoutes from './routes/orderRoutes';
import pmsRoutes from './routes/pmsRoutes';
import { apiKeyAuth } from './middleware/apiKeyAuth';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import testRoutes from './routes/testRoutes';

const app = express();

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
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.PMS_URL,
      process.env.STOREFRONT_URL
    ].filter(Boolean) as string[];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Test routes should be before protected routes
app.use('/api/test', testRoutes);

// Protected routes
app.use('/api/products', apiKeyAuth, productRoutes);
app.use('/api/categories', apiKeyAuth, categoryRoutes);
app.use('/api/inventory', apiKeyAuth, inventoryRoutes);
app.use('/api/orders', apiKeyAuth, orderRoutes);
app.use('/api/pms', apiKeyAuth, pmsRoutes); // Add PMS routes
app.use('/api/pms/products', apiKeyAuth, productRoutes); // Add product routes

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler should be last
app.use(errorHandler);

const server = app.listen(process.env.PORT, () => {
  server.keepAliveTimeout = 60000; // Milliseconds to keep connections alive
  server.headersTimeout = 65000; // Slightly higher than keepAliveTimeout
});

export { app };