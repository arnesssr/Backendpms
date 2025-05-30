export const API_KEY = process.env.API_KEY || '90fdcd12e589a310142d59075fb50e4803baa96949bfeff5188ccf022fc8cce4'

export const DATABASE_URL = process.env.DATABASE_URL
export const PORT = process.env.PORT || 3000
export const NODE_ENV = process.env.NODE_ENV || 'development'

// API Endpoints
export const API_PREFIX = '/api'
export const API_VERSION = 'v1'

// Validation Constants
export const MAX_PAGE_SIZE = 100
export const DEFAULT_PAGE_SIZE = 20

// File Upload Limits
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
