import * as seed from '../data/seed.js'

// The in-memory "database": one array of rows per table, same columns as
// dbms/03_schema.sql. Only the models read and write it, so phase 5 can
// swap them for SQL queries without touching the controllers.

const TABLES = [
  'users',
  'communities',
  'community_memberships',
  'categories',
  'items',
  'item_images',
  'verification_questions',
  'claims',
  'handovers',
  'notifications',
]

export const db = {}

// Puts the seed data back. Runs once at startup, tests can call it too.
export function resetDb() {
  for (const table of TABLES) {
    db[table] = structuredClone(seed[table] || [])
  }
}

resetDb()
