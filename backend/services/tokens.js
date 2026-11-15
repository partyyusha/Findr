import jwt from 'jsonwebtoken'
import config from '../config/index.js'

// After login the frontend gets a signed token and sends it back on every
// request as "Authorization: Bearer <token>". The signature means nobody can
// fake one without JWT_SECRET.

export function createToken(userId) {
  return jwt.sign({ sub: userId }, config.jwtSecret, { expiresIn: config.tokenLifetime })
}

// The user id inside a valid token, or null if it's fake, broken or expired
export function readToken(token) {
  try {
    return jwt.verify(token, config.jwtSecret).sub
  } catch {
    return null
  }
}
