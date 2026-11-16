import cors from 'cors'
import express from 'express'
import config from './config/index.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'
import apiRoutes from './routes/index.js'

// Builds the Express app. server.js starts it, the tests use it directly.
export function createApp() {
  const app = express()

  // only the frontend may call the API from a browser
  app.use(cors({ origin: config.corsOrigin }))
  app.use(express.json({ limit: '100kb' }))

  app.use('/api', apiRoutes)

  app.use(notFound)
  app.use(errorHandler)

  return app
}
