# Findr backend

The REST API for Findr, built with Node.js and Express.

Data is kept in memory for now (it resets when the server restarts).
Phase 5 moves it to PostgreSQL using the schema in `dbms/03_schema.sql`.

## Run it

You need Node.js 20 or newer.

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The API runs on http://localhost:4000/api. Check it with http://localhost:4000/api/health.

- `npm run dev` restarts the server when you save a file
- `npm start` runs it without watching
- `npm test` runs the tests in `tests/`

## Folders

```
backend/
├── server.js        starts the server
├── app.js           builds the Express app (routes, middleware)
├── config/          settings from .env
├── routes/          which URL goes to which controller
├── controllers/     reads the request, calls the models, sends the response
├── models/          reading and writing data (in memory now, SQL in phase 5)
├── services/        the business rules
├── middleware/      code that runs before routes, like error handling
├── utils/           small helpers
└── tests/           API tests (node --test + supertest)
```

## Errors

Every error comes back in the same shape, with a fitting status code:

```json
{ "error": { "message": "Item not found." } }
```

Form errors also have `fields`, like `{ "title": "Use at least 3 characters." }`.

## Endpoints

| Method | Path | What it does |
| --- | --- | --- |
| GET | `/api/health` | Is the API up? |
