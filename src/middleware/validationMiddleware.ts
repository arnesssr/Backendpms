import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import xss, { IFilterXSSOptions } from 'xss';

type ValidationSchema = z.ZodType<any, any>;
type BusinessRule = (data: any) => Promise<boolean> | boolean;

interface ValidationOptions {
  schema?: ValidationSchema;
  businessRules?: BusinessRule[];
  sanitize?: boolean;
}

const sanitizeOptions: IFilterXSSOptions = {
  whiteList: {}, // Restrict all HTML tags
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script'] // Remove script tags and their contents
};

export const validate = (options: ValidationOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let data = req.body;

      // Input sanitization
      if (options.sanitize) {
        data = sanitizeData(data);
      }

      // Schema validation with proper type handling
      if (options.schema) {
        data = await options.schema.parseAsync(data);
      }

      // Business rules validation
      if (options.businessRules) {
        for (const rule of options.businessRules) {
          const isValid = await rule(data);
          if (!isValid) {
            return res.status(422).json({
              success: false,
              message: 'Business rule validation failed'
            });
          }
        }
      }

      req.body = data;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors
        });
      }
      next(error);
    }
  };
};

const sanitizeData = (data: any): any => {
  if (typeof data === 'string') {
    return xss(data.trim(), sanitizeOptions);
  }
  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }
  if (data && typeof data === 'object') {
    return Object.keys(data).reduce((acc, key) => ({
      ...acc,
      [key]: sanitizeData(data[key])
    }), {});
  }
  return data;
};
