import 'dotenv/config'

// Every setting the backend reads from the environment (.env), in one place.
// Defaults are fine for running it on your own computer.

const config = {
  port: Number(process.env.PORT) || 4000,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  isProduction: process.env.NODE_ENV === 'production',

  // signs login tokens. Must be a long random secret on a real server.
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret-change-me',
  tokenLifetime: process.env.TOKEN_LIFETIME || '7d',
}

if (config.isProduction && !process.env.JWT_SECRET) {
  throw new Error('Set JWT_SECRET in .env before running in production.')
}

export default config
