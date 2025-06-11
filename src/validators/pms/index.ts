export * from './productValidator';
export * from './inventoryValidator';
export * from './webhookValidator';
export * from './imageValidator';

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string | Array<{ field: string; message: string }>;
}
