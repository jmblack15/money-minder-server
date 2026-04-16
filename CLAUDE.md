# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start infrastructure (Postgres + Redis + pgAdmin)
docker compose up -d

# Development server (nodemon)
npm run dev

# Database
npm run db:migrate    # create and apply migration
npm run db:push       # apply schema without a migration (dev only)
npm run db:seed       # seed global categories
npm run db:generate   # regenerate Prisma client after schema changes
npm run db:studio     # open Prisma Studio at http://localhost:5555
npm run db:reset      # reset DB and re-run all migrations + seed
```

There are no test scripts configured yet.

## Architecture

REST API for a personal finance mobile app (React Native). The stack is **Node.js (ESM) + Express + Prisma 7 + PostgreSQL + Redis**.

### Module structure

Each domain lives under `src/modules/<name>/` and follows a strict 4-file pattern:

| File | Responsibility |
|------|----------------|
| `*.routes.js` | Declares Express routes, wires validation + controller |
| `*.validation.js` | Zod schemas for request bodies |
| `*.controller.js` | Thin — calls service, calls `successResponse`, passes errors to `next` |
| `*.service.js` | All business logic and Prisma queries |

Modules: `auth`, `accounts`, `categories`, `transactions`, `budgets`, `savingsGoals`, `reports`.

### Request lifecycle

```
Request
  → rate limiter (global 200/15min; auth routes 20/15min)
  → passport-jwt (for protected routes via authMiddleware)
  → validate(zodSchema) middleware
  → controller → service
  → successResponse() OR next(err) → errorHandler
```

All protected routes are grouped under a single `protectedRouter` in [src/server.js](src/server.js) with `authMiddleware` applied once.

### Authentication & session management (Redis)

- **Access token** (JWT, 15 min): verified by `passport-jwt`; invalidated on logout via a Redis blacklist (`blacklist:<token>` key with TTL = remaining token lifetime).
- **Refresh token** (JWT, 7 days): stored in Redis as `refresh:<userId>`. Only one active refresh token per user (single-session).
- `req.user` is set to `{ id, email }` after successful auth; `req.token` holds the raw access token string (needed for logout).

### Balance consistency

All transaction mutations (create, update, delete) run inside `prisma.$transaction()` to atomically update both the `Transaction` record and the affected `Account.balance` fields. On update/delete the old balance effect is reversed before the new one is applied — see [src/modules/transactions/transactions.service.js](src/modules/transactions/transactions.service.js).

### Response format

All responses use a uniform envelope:

```js
// Success — via successResponse() in src/utils/responseHandler.js
{ status: 'success', message: '...', data: { ... } }

// Error — via errorHandler in src/middleware/errorHandler.js
{ success: false, message: '...', errors?: [...] }
```

`errorHandler` maps Prisma error codes (P2002, P2025, etc.) to HTTP status codes and normalises Zod validation errors (`ZodValidationError`). Throw `new Error()` with an `err.statusCode` property from services to control HTTP status.

### Prisma setup

Prisma 7 uses the `@prisma/adapter-pg` driver adapter — the `PrismaClient` is instantiated with `new PrismaPg({ connectionString })`. The schema does **not** include a `url` in the datasource block; the connection string comes entirely from `process.env.DATABASE_URL` at runtime.

Singleton pattern in [src/config/prisma.js](src/config/prisma.js) prevents multiple connections during hot-reload in development.

### Categories: global vs. user-owned

`Category.userId` is nullable. `null` = global category (seeded via `prisma/seed.js`); non-null = user-created category. The categories service returns both when listing.

## Environment variables

Required at startup (`src/config/env.js` throws if missing):

```
DATABASE_URL        # postgresql connection string
REDIS_URL           # redis connection string
JWT_SECRET
JWT_REFRESH_SECRET
```

Optional (have defaults):

```
JWT_ACCESS_EXPIRES_IN   # default "15m"
JWT_REFRESH_EXPIRES_IN  # default "7d"
PORT                    # default 3000
NODE_ENV                # default "development"
```

Copy `.env.example` to `.env` — the defaults work out of the box with `docker compose up -d`.

## Dev tools

| Tool | URL |
|------|-----|
| pgAdmin | http://localhost:5050 (admin@admin.com / admin) |
| Prisma Studio | http://localhost:5555 (run `npm run db:studio`) |
