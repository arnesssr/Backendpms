import { Request, Response } from 'express';
import { CreateOrderDTO } from '../models/order.types';

export interface OrderController {
  createOrder(req: Request, res: Response): Promise<void>;
  getOrderById(req: Request, res: Response): Promise<void>;
  updateOrderStatus(req: Request, res: Response): Promise<void>;
  getAllOrders(req: Request, res: Response): Promise<void>;
}

export interface CreateOrderRequest extends Request {
  body: CreateOrderDTO;
}

export interface UpdateOrderStatusRequest extends Request {
  body: {
    status: string;
  };
}
