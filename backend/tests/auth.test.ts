import { describe, it, expect } from 'vitest'
import authRoutes from '../src/routes/authRoutes'
import type { Request, Response } from 'express'

describe('Authentication Route Unit Tests', () => {
  const findHandler = (method: string, path: string) => {
    const layer = (authRoutes as any).stack.find(
      (s: any) => s.route && s.route.path === path && s.route.methods[method.toLowerCase()]
    )
    return layer?.route?.stack[0]?.handle
  }

  const mockRes = () => {
    const res: any = {}
    res.statusCode = 200
    res.status = (code: number) => {
      res.statusCode = code
      return res
    }
    res.json = (data: any) => {
      res.jsonData = data
      return res
    }
    return res
  }

  it('should authenticate successfully with configured credentials', async () => {
    const loginHandler = findHandler('post', '/login')
    expect(loginHandler).toBeDefined()

    const req: any = {
      body: {
        username: 'archanakmhss@gmail.com',
        password: 'paypulse2026'
      }
    }
    const res = mockRes()

    await loginHandler(req as Request, res as Response)

    expect(res.statusCode).toBe(200)
    expect(res.jsonData.success).toBe(true)
    expect(res.jsonData.user.email).toBe('archanakmhss@gmail.com')
    expect(res.jsonData.user.name).toBe('Archana Sekar')
  })

  it('should authenticate successfully with username alias "archana"', async () => {
    const loginHandler = findHandler('post', '/login')
    const req: any = {
      body: {
        username: 'archana',
        password: 'paypulse2026'
      }
    }
    const res = mockRes()

    await loginHandler(req as Request, res as Response)

    expect(res.statusCode).toBe(200)
    expect(res.jsonData.success).toBe(true)
  })

  it('should reject invalid password with 401', async () => {
    const loginHandler = findHandler('post', '/login')
    const req: any = {
      body: {
        username: 'archanakmhss@gmail.com',
        password: 'incorrectPassword'
      }
    }
    const res = mockRes()

    await loginHandler(req as Request, res as Response)

    expect(res.statusCode).toBe(401)
    expect(res.jsonData.success).toBe(false)
    expect(res.jsonData.error).toContain('Invalid username or password')
  })

  it('should return 400 if credentials are empty', async () => {
    const loginHandler = findHandler('post', '/login')
    const req: any = {
      body: {
        username: '',
        password: ''
      }
    }
    const res = mockRes()

    await loginHandler(req as Request, res as Response)

    expect(res.statusCode).toBe(400)
    expect(res.jsonData.success).toBe(false)
  })

  it('should logout cleanly', async () => {
    const logoutHandler = findHandler('post', '/logout')
    const req: any = {}
    const res = mockRes()

    await logoutHandler(req as Request, res as Response)

    expect(res.statusCode).toBe(200)
    expect(res.jsonData.success).toBe(true)
  })
})
