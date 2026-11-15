import { listCategories, listCommunities } from '../models/referenceModel.js'

// GET /api/categories
export function getCategories(req, res) {
  res.json({ categories: listCategories() })
}

// GET /api/communities
export function getCommunities(req, res) {
  res.json({ communities: listCommunities() })
}
