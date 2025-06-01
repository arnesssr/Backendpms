import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import axios, { AxiosInstance } from 'axios'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.test' })

const API_URL = process.env.API_URL
const API_KEY = process.env.API_KEY

let axiosInstance: AxiosInstance

beforeAll(() => {
  axiosInstance = axios.create({
    timeout: 5000,
    headers: {
      'X-API-Key': API_KEY
    }
  })
})

describe('Backend API Connection Tests', () => {
  it('should connect to backend API', async () => {
    const response = await axiosInstance.get(`${API_URL}/api/test/connection`)
    
    expect(response.status).toBe(200)
    expect(response.data).toHaveProperty('message', 'Connection successful')
  })

  it('should verify database connection through API', async () => {
    const response = await axiosInstance.get(`${API_URL}/api/test/database`)
    
    expect(response.status).toBe(200)
    expect(response.data).toHaveProperty('connected', true)
  })

  it('should handle authentication', async () => {
    const response = await axiosInstance.get(`${API_URL}/api/test/auth`)
    
    expect(response.status).toBe(200)
  })
})

afterAll(async () => {
  if (axiosInstance) {
    // Cancel any pending requests
    const controller = new AbortController()
    axiosInstance.interceptors.request.use((config) => {
      config.signal = controller.signal
      return config
    })
    controller.abort()
  }
  // Allow time for connections to close
  await new Promise(resolve => setTimeout(resolve, 1000))
})
