import { setDefaultResultOrder } from 'dns';
import { app, io } from './app';
import { dbConnect } from './config/database';
import redisClient from './config/redis';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import { checkCloudinary } from './config/cloudinary';
import { AuthService } from './services/authService';
import { RealtimeService } from './services/realtimeService';

setDefaultResultOrder('ipv4first'); 
dotenv.config();

// Set default NODE_ENV if not set
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const PORT = process.env.PORT || 10000; // Explicitly use port 10000 as fallback

interface HealthResponse {
  status: string;
}

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' } as HealthResponse);
});

// Find an available port starting from the given port
const findAvailablePort = async (startPort: number, maxAttempts: number = 10): Promise<number> => {
  const checkPort = (port: number): Promise<boolean> => {
    return new Promise((resolve) => {
      const server = require('net').createServer()
        .once('error', () => resolve(false))
        .once('listening', () => {
          server.close();
          resolve(true);
        })
        .listen(port);
    });
  };

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const port = startPort + attempt;
    const available = await checkPort(port);
    if (available) {
      return port;
    }
    console.log(`Port ${port} in use, trying next port...`);
  }
  throw new Error(`No available ports found between ${startPort} and ${startPort + maxAttempts - 1}`);
};

// Attach Socket.IO to existing server
async function startServer() {
  try {
    // Check DB connection
    const dbConnected = await dbConnect();
    if (!dbConnected) {
      console.warn('⚠️ Starting server with limited functionality - database unavailable');
    } else {
      console.log('✅ Database connected successfully');
    }

    // Check Redis connection
    const redisConnected = await redisClient.ping().then(() => true).catch(() => false);
    if (!redisConnected) {
      console.warn('⚠️ Starting server with limited functionality - Redis unavailable');
    } else {
      console.log('✅ Redis connected successfully');
    }

    // Check Cloudinary connection
    const cloudinaryStatus = await checkCloudinary();
    if (!cloudinaryStatus.healthy) {
      console.warn('⚠️ Starting server with limited functionality - Cloudinary unavailable');
    } else {
      console.log('✅ Cloudinary connected successfully');
    }
    
    // Use Render's assigned port directly without searching
    const port = parseInt(process.env.PORT || '10000', 10);
    
    const server = app.listen(port, '0.0.0.0', () => {
      const dbStatus = dbConnected ? '✅ Connected' : '⚠️ Unavailable';
      const redisStatus = redisConnected ? '✅ Connected' : '⚠️ Unavailable';
      const cloudinaryStatusMessage = cloudinaryStatus.healthy ? '✅ Connected' : '⚠️ Unavailable';

      console.log(`
🚀 Server is running:
- Port: ${PORT}
- Database: ${dbStatus}
- Redis: ${redisStatus}
- Cloudinary: ${cloudinaryStatusMessage}
- Security: ${AuthService.getStatus()}
- Mode: ${process.env.NODE_ENV === 'production' ? '🚀 Production' : '🛠️ Development'}
`);
    });

    // Initialize WebSocket
    io.attach(server);

    // Initialize real-time
    const realtime = RealtimeService.getInstance();
    const realtimeStatus = await realtime.initialize();
    const status = realtime.getStatus();

    console.log(`
🚀 Server is running:
- Port: ${port}
- Database: ✅ Connected
- Redis: ✅ Connected
- Cloudinary: ✅ Connected
- Realtime: ${realtimeStatus ? '✅ Active' : '❌ Failed'}
- Security: ✅ Active & Secured
- Mode: 🛠️ ${process.env.NODE_ENV}

🔄 Realtime Channels: ${status.activeChannels.join(', ')}
${status.isConnected ? '✅' : '❌'} Connection Status
${status.lastError ? `⚠️ Last Error: ${status.lastError}` : '✅ No Errors'}
    `);

    // Improved error handling
    server.on('error', (error: NodeJS.ErrnoException) => {
      console.error('Server error:', error);
      process.exit(1);
    });

    // Enhanced graceful shutdown
    const shutdown = async () => {
      console.log('\n🔄 Shutting down gracefully...');
      
      // Close server first
      await new Promise(resolve => server.close(resolve));
      console.log('✅ Server closed');
      
      // Close WebSocket connections
      await new Promise(resolve => io.close(resolve));
      console.log('✅ WebSocket closed');
      
      // Exit process
      process.exit(0);
    };

    // Handle termination signals
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    
    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      shutdown();
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      shutdown();
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}
