import axios from 'axios'

// Normalize API URL to ensure /api suffix is present
const rawUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api').trim()
const cleanUrl = rawUrl.replace(/\/+$/, '')
const API_BASE_URL = cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
})
