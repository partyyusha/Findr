import { Router } from 'express'
import healthRoutes from './healthRoutes.js'

// Every route of the API lives under /api
const router = Router()

router.use('/health', healthRoutes)

export default router
