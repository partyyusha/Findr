import { Router } from 'express'
import { getCategories, getCommunities } from '../controllers/referenceController.js'

const router = Router()

router.get('/categories', getCategories)
router.get('/communities', getCommunities)

export default router
