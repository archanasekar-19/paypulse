import express from 'express'
import type { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import employeeRoutes from './routes/employeeRoutes'
import analyticsRoutes from './routes/analyticsRoutes'
import authRoutes from './routes/authRoutes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

// Middleware
app.use(cors())
app.use(express.json())

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'PayPulse Backend API' })
})

app.get('/', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'PayPulse Backend API', version: '1.0.0' })
})

// Mount application REST API routes
app.use('/api/auth', authRoutes)
app.use('/api/employees', employeeRoutes)
app.use('/api', analyticsRoutes)
app.use('/api/analytics', analyticsRoutes)

app.listen(PORT, () => {
  console.log(`PayPulse Backend running at http://localhost:${PORT}`)
})

export default app
