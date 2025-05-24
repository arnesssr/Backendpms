import request from 'supertest';
import { app } from '../../app';

export const testClient = {
  products: {
    getAll: () => request(app).get('/api/products'),
    getOne: (id: string) => request(app).get(`/api/products/${id}`),
    create: (data: any) => request(app).post('/api/products').send(data),
    update: (id: string, data: any) => request(app).put(`/api/products/${id}`).send(data),
    delete: (id: string) => request(app).delete(`/api/products/${id}`)
  },

  categories: {
    create: (data: any) => request(app)
      .post('/api/categories')
      .send(data),
      
    getAll: () => request(app)
      .get('/api/categories'),
      
    update: (id: string, data: any) => request(app)
      .put(`/api/categories/${id}`)
      .send(data),
      
    delete: (id: string) => request(app)
      .delete(`/api/categories/${id}`),
      
    getProducts: (id: string) => request(app)
      .get(`/api/categories/${id}/products`)
  },

  inventory: {
    getStock: (productId: string) => request(app).get(`/api/inventory/${productId}/stock`),
    updateStock: (productId: string, data: any) => request(app).put(`/api/inventory/${productId}/stock`).send(data),
    create: (productId: string) => request(app).post(`/api/inventory/${productId}`),
    addMovement: (productId: string, data: any) => request(app).post(`/api/inventory/${productId}/movements`).send(data),
    getMovements: (productId: string) => request(app).get(`/api/inventory/${productId}/movements`),
    getLowStockAlerts: () => request(app).get('/api/inventory/low-stock')
  },

  orders: {
    create: (data: any) => request(app)
      .post('/api/orders')
      .send(data),
      
    getOne: (id: string) => request(app)
      .get(`/api/orders/${id}`),
      
    updateStatus: (id: string, data: any) => request(app)
      .patch(`/api/orders/${id}/status`)
      .send(data),
      
    getAll: () => request(app)
      .get('/api/orders')
  }
};
