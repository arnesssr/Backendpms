import request from 'supertest'
import { app } from '../../app'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.test' })

const API_KEY = process.env.API_KEY

if (!API_KEY) {
  throw new Error('API_KEY not found in .env.test')
}

const headers = {
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY
}

export const testClient = {
  products: {
    create: (data: any) => 
      request(app)
        .post('/api/products')
        .set(headers)
        .send(data),
    
    getAll: (params?: { page?: number; limit?: number }) => 
      request(app)
        .get('/api/products')
        .set(headers)
        .query(params || {}),

    getOne: (id: string) =>
      request(app)
        .get(`/api/products/${id}`)
        .set(headers),

    update: (id: string, data: any) =>
      request(app)
        .patch(`/api/products/${id}`)
        .set(headers)
        .send(data),

    delete: (id: string) =>
      request(app)
        .delete(`/api/products/${id}`)
        .set(headers)
  }
}
