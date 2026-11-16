// An error that knows its HTTP status, so the error handler can send it as is.
//   throw new HttpError(404, 'Item not found.')
// fields: { title: 'Too short' } for form errors the frontend can show next to inputs
export class HttpError extends Error {
  constructor(status, message, fields = undefined) {
    super(message)
    this.status = status
    this.fields = fields
  }
}
