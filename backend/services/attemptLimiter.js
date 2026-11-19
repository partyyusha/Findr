import { HttpError } from '../utils/httpError.js'

// Counts failed tries (wrong password, wrong claim answer) so nobody can
// guess forever. Kept in memory, which is fine for one server.
//   const limiter = createAttemptLimiter({ maxFailures: 5, windowMinutes: 15 })
//   limiter.check(key)   throws 429 if that key failed too often
//   limiter.fail(key)    count one more failure
//   limiter.reset(key)   after a success
export function createAttemptLimiter({ maxFailures, windowMinutes, message }) {
  const failures = new Map() // key -> { count, firstAt }
  const windowMs = windowMinutes * 60 * 1000

  function current(key) {
    const entry = failures.get(key)
    if (entry && Date.now() - entry.firstAt > windowMs) {
      failures.delete(key)
      return null
    }
    return entry
  }

  return {
    check(key) {
      const entry = current(key)
      if (entry && entry.count >= maxFailures) {
        throw new HttpError(429, message)
      }
    },
    fail(key) {
      const entry = current(key)
      if (entry) {
        entry.count += 1
      } else {
        failures.set(key, { count: 1, firstAt: Date.now() })
      }
    },
    reset(key) {
      failures.delete(key)
    },
  }
}
