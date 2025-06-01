import { describe, it, expect } from '@jest/globals'
import axios, { AxiosResponse } from 'axios'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.test' })

const API_URL = 'https://backendpms-wvoo.onrender.com'
const API_KEY = process.env.API_KEY

interface APIResponse {
  message?: string
  connected?: boolean
}

describe('Backend API Connection Tests', () => {
  it('should connect to backend API', async () => {
    try {
      const response: AxiosResponse<APIResponse> = await axios.get(`${API_URL}/api/test/connection`, {
        headers: {
          'X-API-Key': API_KEY
        }
      })
      
      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('message', 'Connection successful')
    } catch (error) {
      console.error('API Connection Test Failed:', error)
      throw error
    }
  })

  it('should verify database connection through API', async () => {
    const response = await axios.get(`${API_URL}/api/test/database`, {
      headers: {
        'X-API-Key': API_KEY
      }
    })
    
    expect(response.status).toBe(200)
    expect(response.data).toHaveProperty('connected', true)
  })

  it('should handle authentication', async () => {
    const response = await axios.get(`${API_URL}/api/test/auth`, {
      headers: {
        'X-API-Key': API_KEY
      }
    })
    
    expect(response.status).toBe(200)
  })
})
