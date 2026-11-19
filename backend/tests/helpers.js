import request from 'supertest'

// Every demo account uses this password (see data/seed.js)
export const DEMO_PASSWORD = 'findr123'

// Logs in a seed user and returns the "Authorization" header value
export async function loginAs(app, email) {
  const res = await request(app).post('/api/auth/login').send({ email, password: DEMO_PASSWORD })
  if (res.status !== 200) {
    throw new Error(`Login failed for ${email}: ${res.status}`)
  }
  return `Bearer ${res.body.token}`
}
