import { setDefaultResultOrder } from 'dns';
import { app } from './app';
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

// Add more detailed startup logging
async function startServer() {
  try {
    await dbConnect();
    console.log('✅ Database connected successfully');
    
    const server = app.listen(PORT, () => {
      console.log(`\n🚀 Server is running:
- Local: http://localhost:${PORT}
- PMS URL: ${process.env.PMS_URL}
- Test endpoint: http://localhost:${PORT}/api/test/test-product`);
    });

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        console.log(`⚠️ Port ${PORT} is already in use`);
        // Try a different port or exit gracefully
        process.exit(1);
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
