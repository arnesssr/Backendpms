import { Request, Response, NextFunction } from 'express';
import { MonitoringService } from '../services/monitoringService';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Log request
  console.log('\n🟦 Incoming Request:');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Origin:', req.headers.origin);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log('\n🟨 Response sent:');
    console.log('Status:', res.statusCode);
    console.log('Duration:', duration + 'ms');
    console.log('------------------------');

    // Add performance metrics collection
    MonitoringService.getInstance().recordMetrics(req, res, duration).catch(console.error);
  });

  next();
};
