import { db } from './db.js'

// Small lookup tables: categories and communities

export function listCategories() {
  return db.categories
}

export function findCategory(categoryId) {
  return db.categories.find((row) => row.category_id === categoryId) || null
}

export function listCommunities() {
  return db.communities
}

export function findCommunity(communityId) {
  return db.communities.find((row) => row.community_id === communityId) || null
}
