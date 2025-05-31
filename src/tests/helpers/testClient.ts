import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.test' })

const API_URL = process.env.API_URL
const API_KEY = process.env.API_KEY

if (!API_URL || !API_KEY) {
  throw new Error('API_URL and API_KEY must be defined in .env.test')
}

const headers = {
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY
}

export const testClient = {
  products: {
    create: (data: any) => 
      axios.post(`${API_URL}/products`, data, { headers })
        .then(res => ({ status: res.status, body: res.data })),

    getAll: (params?: { page?: number; limit?: number }) => 
      axios.get(`${API_URL}/products`, { 
        headers,
        params 
      })
        .then(res => ({ status: res.status, body: res.data }))
  }
}
