import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import axios, { AxiosInstance } from 'axios'
import https from 'https'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.test' })

const API_URL = process.env.API_URL
const API_KEY = process.env.API_KEY

let axiosInstance: AxiosInstance
let httpsAgent: https.Agent

beforeAll(() => {
  httpsAgent = new https.Agent({ keepAlive: false })
  axiosInstance = axios.create({
    timeout: 15000,
    httpsAgent,
    headers: {
      'X-API-Key': API_KEY
    },
    validateStatus: (status) => status < 500 // Don't throw on 4xx errors
  })
})

describe('Backend API Connection Tests', () => {
  const testWithRetry = async (fn: () => Promise<any>, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn()
      } catch (error) {
        if (i === retries - 1) throw error
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
  }

  it('should connect to backend API', async () => {
    await testWithRetry(async () => {
      const response = await axiosInstance.get(`${API_URL}/api/test/connection`)
      
      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('message', 'Connection successful')
    })
  }, 30000) // Test timeout

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
  httpsAgent.destroy()
  await new Promise(resolve => setTimeout(resolve, 500))
  // Force close all connections
  if (axiosInstance) {
    axiosInstance.interceptors.request.eject(0)
    axiosInstance.interceptors.response.eject(0)
  }
})
