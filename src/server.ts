import { setDefaultResultOrder } from 'dns';
import { app, io } from './app';  // Import io from app.ts
import { dbConnect } from './config/database';
import dotenv from 'dotenv';
import { Request, Response } from 'express';

setDefaultResultOrder('ipv4first'); 
dotenv.config();

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
    await dbConnect();
    console.log('✅ Database connected successfully');
    
    // Try ports starting from env.PORT or 10000, with more attempts
    const port = await findAvailablePort(parseInt(process.env.PORT || '10000'), 20);
    console.log(`🔍 Found available port: ${port}`);
    
    const server = app.listen(port, () => {
      console.log(`\n🚀 Server is running:
- Local API: http://localhost:${port}
- Health Check: http://localhost:${port}/health
- Connection Tests:
  • Basic API: http://localhost:${port}/api/test/test-product
  • Database: http://localhost:${port}/api/test/connection
  • PMS Auth: http://localhost:${port}/api/test/pms-connection (requires API key)
`);
    });

    // Initialize WebSocket
    io.attach(server);

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        console.log(`⚠️ Port ${port} is already in use, trying next port...`);
        // Port will be handled by findAvailablePort
      } else {
        console.error('Server error:', error);
      }
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}
