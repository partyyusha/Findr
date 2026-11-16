import { copy, createId, db, networkDelay, saveDb, setSessionUserId } from './mockStore'
import { sha256 } from '../utils/sha256'

// Login is simulated: accounts live in the mock db and "logged in" is a
// user id in localStorage. Phase 4 swaps this for real auth with tokens.

function hashPassword(password) {
  return sha256(password)
}

function findUserByEmail(email) {
  const wanted = email.trim().toLowerCase()
  return db.users.find((user) => user.email.toLowerCase() === wanted)
}

// phase 5: POST /api/auth/login
export async function logIn(email, password) {
  await networkDelay(300)

  const user = findUserByEmail(email)
  // same message for both cases so nobody can check which emails have accounts
  if (!user || user.password_hash !== hashPassword(password)) {
    throw new Error('Wrong email or password.')
  }

  setSessionUserId(user.user_id)
}

// phase 5: POST /api/auth/signup
export async function signUp({ full_name, email, password, community_id }) {
  await networkDelay(400)

  if (findUserByEmail(email)) {
    throw new Error('There is already an account with this email. Try logging in.')
  }
  if (!db.communities.some((community) => community.community_id === community_id)) {
    throw new Error('Choose your community.')
  }
  if (password.length < 8) {
    throw new Error('Use at least 8 characters for your password.')
  }

  const now = new Date().toISOString()
  const user = {
    user_id: createId('user'),
    full_name: full_name.trim(),
    email: email.trim().toLowerCase(),
    password_hash: hashPassword(password),
    phone: null,
    profile_image_url: null,
    created_at: now,
  }

  db.users.push(user)
  db.community_memberships.push({
    membership_id: createId('membership'),
    community_id,
    user_id: user.user_id,
    role: 'MEMBER',
    membership_status: 'ACTIVE',
    joined_at: now,
  })
  saveDb()

  setSessionUserId(user.user_id)
  return copy({ user_id: user.user_id })
}

// phase 5: POST /api/auth/logout
export async function logOut() {
  setSessionUserId(null)
}
