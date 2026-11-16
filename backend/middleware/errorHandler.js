import { HttpError } from '../utils/httpError.js'

// Requests that matched no route
export function notFound(req, res, next) {
  next(new HttpError(404, `No route for ${req.method} ${req.originalUrl}`))
}

// Every error ends up here and goes back as { error: { message, fields? } }.
// Express 5 also sends errors thrown in async handlers here, no try/catch needed.
// eslint-disable-next-line no-unused-vars
export function errorHandler(error, req, res, next) {
  // bad JSON in the request body
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { message: 'The request body is not valid JSON.' } })
  }

  if (error instanceof HttpError) {
    return res.status(error.status).json({ error: { message: error.message, fields: error.fields } })
  }

  // anything else is a bug, so log it and don't leak details
  console.error(error)
  res.status(500).json({ error: { message: 'Something went wrong on our side.' } })
}
