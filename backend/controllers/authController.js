import { findCommunity } from '../models/referenceModel.js'
import { createUser, findUserByEmail, toCurrentUser } from '../models/userModel.js'
import { createAttemptLimiter } from '../services/attemptLimiter.js'
import { checkPassword, hashPassword } from '../services/passwords.js'
import { createToken } from '../services/tokens.js'
import { HttpError } from '../utils/httpError.js'
import { isEmail, text } from '../utils/validators.js'

// 10 wrong passwords for one email locks it for 15 minutes
const loginLimiter = createAttemptLimiter({
  maxFailures: 10,
  windowMinutes: 15,
  message: 'Too many wrong passwords. Wait 15 minutes and try again.',
})

// POST /api/auth/signup  { full_name, email, password, community_id }
export async function signUp(req, res) {
  const fullName = text(req.body.full_name)
  const email = text(req.body.email).toLowerCase()
  const password = typeof req.body.password === 'string' ? req.body.password : ''
  const communityId = text(req.body.community_id)

  const fields = {}
  if (fullName.length < 2) fields.full_name = 'Enter your name.'
  if (!isEmail(email)) fields.email = 'Enter a valid email.'
  if (password.length < 8) fields.password = 'Use at least 8 characters.'
  if (!findCommunity(communityId)) fields.community_id = 'Choose your community.'
  if (Object.keys(fields).length > 0) {
    throw new HttpError(422, 'Some details need fixing.', fields)
  }

  if (findUserByEmail(email)) {
    throw new HttpError(409, 'There is already an account with this email. Try logging in.')
  }

  const user = createUser({
    full_name: fullName,
    email,
    password_hash: await hashPassword(password),
    community_id: communityId,
  })

  res.status(201).json({ token: createToken(user.user_id), user: toCurrentUser(user) })
}

// POST /api/auth/login  { email, password }
export async function logIn(req, res) {
  const email = text(req.body.email).toLowerCase()
  const password = typeof req.body.password === 'string' ? req.body.password : ''

  loginLimiter.check(email)

  const user = findUserByEmail(email)
  // same message for both cases so nobody can check which emails have accounts
  if (!user || !(await checkPassword(password, user.password_hash))) {
    loginLimiter.fail(email)
    throw new HttpError(401, 'Wrong email or password.')
  }

  loginLimiter.reset(email)
  res.json({ token: createToken(user.user_id), user: toCurrentUser(user) })
}

// GET /api/me
export function getMe(req, res) {
  res.json({ user: req.user })
}
