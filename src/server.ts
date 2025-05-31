import { setDefaultResultOrder } from 'dns';
import { app } from './app';
import { dbConnect } from './config/database';
import dotenv from 'dotenv';
import { Request, Response } from 'express';

setDefaultResultOrder('ipv4first'); 
dotenv.config();

const PORT = process.env.PORT || 5000;

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
    
    app.listen(PORT, () => {
      console.log(`\n🚀 Server is running:
- Local: http://localhost:${PORT}
- PMS URL: ${process.env.PMS_URL}
- Test endpoint: http://localhost:${PORT}/api/test/test-product`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}
