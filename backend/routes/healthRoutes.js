import { Router } from 'express'

const router = Router()

// GET /api/health  quick "is the API up?" check
router.get('/', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

export default router
