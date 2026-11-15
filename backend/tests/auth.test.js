import assert from 'node:assert/strict'
import { test } from 'node:test'
import request from 'supertest'
import { createApp } from '../app.js'
import { requireAdmin } from '../middleware/auth.js'
import { DEMO_PASSWORD, loginAs } from './helpers.js'

const app = createApp()

test('login with the right password gives a token and the user', async () => {
  const res = await request(app).post('/api/auth/login').send({ email: 'Aarav@Northfield.edu', password: DEMO_PASSWORD })
  assert.equal(res.status, 200)
  assert.ok(res.body.token)
  assert.equal(res.body.user.full_name, 'Aarav Kapoor')
  assert.equal(res.body.user.password_hash, undefined)
})

test('a wrong password and an unknown email get the same answer', async () => {
  const wrongPassword = await request(app).post('/api/auth/login').send({ email: 'aarav@northfield.edu', password: 'nope' })
  const noAccount = await request(app).post('/api/auth/login').send({ email: 'ghost@northfield.edu', password: 'nope' })
  assert.equal(wrongPassword.status, 401)
  assert.equal(noAccount.status, 401)
  assert.equal(wrongPassword.body.error.message, noAccount.body.error.message)
})

test('too many wrong passwords locks the email for a while', async () => {
  for (let i = 0; i < 10; i++) {
    await request(app).post('/api/auth/login').send({ email: 'meera@greenview.in', password: 'guess' + i })
  }
  const res = await request(app).post('/api/auth/login').send({ email: 'meera@greenview.in', password: DEMO_PASSWORD })
  assert.equal(res.status, 429)
})

test('/api/me needs a valid token', async () => {
  assert.equal((await request(app).get('/api/me')).status, 401)
  assert.equal((await request(app).get('/api/me').set('Authorization', 'Bearer made-up')).status, 401)

  const res = await request(app).get('/api/me').set('Authorization', await loginAs(app, 'rohan@northfield.edu'))
  assert.equal(res.status, 200)
  assert.equal(res.body.user.isAdmin, true)
  assert.equal(res.body.user.communities[0].role, 'COMMUNITY_ADMIN')
})

test('signup checks every field', async () => {
  const res = await request(app).post('/api/auth/signup').send({ full_name: 'A', email: 'not-an-email', password: 'short' })
  assert.equal(res.status, 422)
  assert.deepEqual(Object.keys(res.body.error.fields).sort(), ['community_id', 'email', 'full_name', 'password'])
})

test('signup refuses an email that already has an account', async () => {
  const res = await request(app)
    .post('/api/auth/signup')
    .send({ full_name: 'Copy Cat', email: 'aarav@northfield.edu', password: 'longenough', community_id: 'northfield-college' })
  assert.equal(res.status, 409)
})

test('a new account can log in straight away and is a plain member', async () => {
  const details = { full_name: 'New Student', email: 'new.student@northfield.edu', password: 'testpass1', community_id: 'northfield-college' }
  const signup = await request(app).post('/api/auth/signup').send(details)
  assert.equal(signup.status, 201)
  assert.equal(signup.body.user.isAdmin, false)

  const login = await request(app).post('/api/auth/login').send({ email: details.email, password: details.password })
  assert.equal(login.status, 200)
})

test('requireAdmin lets admins through and stops everyone else', () => {
  let passed = false
  requireAdmin({ user: { isAdmin: true } }, {}, () => {
    passed = true
  })
  assert.equal(passed, true)
  assert.throws(() => requireAdmin({ user: { isAdmin: false } }, {}, () => {}), { status: 403 })
})

test('categories and communities are public', async () => {
  const categories = await request(app).get('/api/categories')
  const communities = await request(app).get('/api/communities')
  assert.equal(categories.body.categories.length, 8)
  assert.equal(communities.body.communities.length, 3)
})
