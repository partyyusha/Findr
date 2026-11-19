import bcrypt from 'bcryptjs'

// bcrypt adds a random salt and is slow on purpose, so leaked hashes are hard to crack.
// 10 rounds is a good balance for a student project server.
const ROUNDS = 10

export function hashPassword(password) {
  return bcrypt.hash(password, ROUNDS)
}

export function checkPassword(password, hash) {
  return bcrypt.compare(password, hash)
}
