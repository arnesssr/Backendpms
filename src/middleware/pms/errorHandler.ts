import { Request, Response, NextFunction } from 'express';
import { pmsEvents } from '../../services/pms/eventEmitter';

export const pmsErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Log error event
  pmsEvents.emit('error', {
    action: 'error',
    path: req.path,
    error: err.message,
    timestamp: new Date()
  });

  // Return error response
  res.status(500).json({
    success: false,
    error: 'PMS Integration Error',
    message: err.message
  });
};
