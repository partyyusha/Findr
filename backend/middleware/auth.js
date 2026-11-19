import { findUserById, toCurrentUser } from '../models/userModel.js'
import { readToken } from '../services/tokens.js'
import { HttpError } from '../utils/httpError.js'

// Reads "Authorization: Bearer <token>" and returns the user, or null
function userFromRequest(req) {
  const [scheme, token] = (req.headers.authorization || '').split(' ')
  if (scheme !== 'Bearer' || !token) {
    return null
  }

  const userId = readToken(token)
  const user = userId && findUserById(userId)
  return user ? toCurrentUser(user) : null
}

// For routes that need an account. Sets req.user.
export function requireAuth(req, res, next) {
  req.user = userFromRequest(req)
  if (!req.user) {
    throw new HttpError(401, 'Please log in first.')
  }
  next()
}

// For public routes that show a bit more to logged in users. req.user may be null.
export function optionalAuth(req, res, next) {
  req.user = userFromRequest(req)
  next()
}

// Admin pages. Use after requireAuth. Which communities they manage is
// checked again in the admin models.
export function requireAdmin(req, res, next) {
  if (!req.user?.isAdmin) {
    throw new HttpError(403, 'Only community admins can do this.')
  }
  next()
}
