import assert from 'node:assert/strict'
import { test } from 'node:test'
import request from 'supertest'
import { createApp } from '../app.js'

const app = createApp()

test('GET /api/health says ok', async () => {
  const res = await request(app).get('/api/health')
  assert.equal(res.status, 200)
  assert.equal(res.body.status, 'ok')
})

test('unknown routes get a 404 in the usual error shape', async () => {
  const res = await request(app).get('/api/nope')
  assert.equal(res.status, 404)
  assert.match(res.body.error.message, /No route/)
})

test('broken JSON gets a 400, not a crash', async () => {
  const res = await request(app).post('/api/health').set('Content-Type', 'application/json').send('{"oops"')
  assert.equal(res.status, 400)
})

test('only the frontend origin is allowed by CORS', async () => {
  const res = await request(app).get('/api/health').set('Origin', 'http://localhost:5173')
  assert.equal(res.headers['access-control-allow-origin'], 'http://localhost:5173')
})
