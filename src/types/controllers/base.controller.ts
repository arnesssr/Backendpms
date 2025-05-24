import { Sql } from 'postgres';
import { Request, Response } from 'express';

export interface BaseController {
  db: Sql;
}

export interface ControllerResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export type ControllerMethod = (req: Request, res: Response) => Promise<void>;
