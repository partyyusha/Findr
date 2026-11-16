import 'dotenv/config'

// Every setting the backend reads from the environment (.env), in one place.
// Defaults are fine for running it on your own computer.

const config = {
  port: Number(process.env.PORT) || 4000,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  isTest: process.env.NODE_ENV === 'test',
}

export default config
