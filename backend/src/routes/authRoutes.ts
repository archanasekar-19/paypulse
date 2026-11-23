import { Router } from 'express'
import type { Request, Response } from 'express'

const router = Router()

/**
 * Default authenticated persona
 */
const DEFAULT_USER = {
  name: 'Archana Sekar',
  email: 'archanakmhss@gmail.com',
  role: 'HR Manager',
  organization: 'ACME Corp • Global'
}

/**
 * POST /api/auth/login
 * Validates credentials against environment variables without complicated token/OAuth mechanisms.
 */
router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body || {}

  const expectedUser = (process.env.AUTH_USERNAME || 'archanakmhss@gmail.com').toLowerCase().trim()
  const expectedPass = (process.env.AUTH_PASSWORD || 'paypulse2026').trim()

  const inputUser = typeof username === 'string' ? username.toLowerCase().trim() : ''
  const inputPass = typeof password === 'string' ? password.trim() : ''

  if (!inputUser || !inputPass) {
    return res.status(400).json({
      success: false,
      error: 'Please provide both username/email and password.'
    })
  }

  // Allow matching configured username, or friendly aliases 'archana' and 'admin'
  const isUsernameValid =
    inputUser === expectedUser ||
    inputUser === 'archana' ||
    inputUser === 'admin'

  const isPasswordValid = inputPass === expectedPass

  if (!isUsernameValid || !isPasswordValid) {
    return res.status(401).json({
      success: false,
      error: 'Invalid username or password. Check your credentials and try again.'
    })
  }

  return res.status(200).json({
    success: true,
    message: 'Authentication successful',
    user: DEFAULT_USER
  })
})

/**
 * POST /api/auth/logout
 * Explicit logout endpoint acknowledging session termination.
 */
router.post('/logout', (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  })
})

/**
 * GET /api/auth/me
 * Returns configured demo persona
 */
router.get('/me', (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    user: DEFAULT_USER
  })
})

export default router
