# Money Minder — Backend API

REST API para aplicación de finanzas personales mobile (React Native). Node.js + Express + Prisma + PostgreSQL + Redis.

## Requisitos

- Node.js 18+
- Docker + Docker Compose

## Inicio rápido

### 1. Variables de entorno

```bash
cp .env.example .env
# Editar .env con tus valores (los defaults funcionan con Docker)
```

### 2. Levantar base de datos y Redis

```bash
docker compose up -d
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Crear esquema de base de datos

```bash
npm run db:migrate
```

> En desarrollo puedes usar `npm run db:push` para aplicar el schema sin crear migraciones.

### 5. Seed de categorías globales

```bash
npm run db:seed
```

### 6. Correr el servidor

```bash
npm run dev       # desarrollo (nodemon)
npm start         # producción
```

El servidor corre en `http://localhost:3000` por defecto.

---

## Endpoints

### Auth
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Login → access_token + refresh_token |
| POST | `/api/auth/refresh` | Renovar access_token |
| POST | `/api/auth/logout` | Invalidar sesión |

### Accounts `🔒`
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/accounts` | Listar cuentas |
| GET | `/api/accounts/:id` | Detalle de cuenta |
| POST | `/api/accounts` | Crear cuenta |
| PUT | `/api/accounts/:id` | Editar cuenta |
| DELETE | `/api/accounts/:id` | Desactivar cuenta |

### Categories `🔒`
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/categories` | Globales + personalizadas |
| POST | `/api/categories` | Crear categoría |
| PUT | `/api/categories/:id` | Editar (solo propias) |
| DELETE | `/api/categories/:id` | Eliminar (solo propias) |

### Transactions `🔒`
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/transactions` | Listar con filtros |
| GET | `/api/transactions/:id` | Detalle |
| POST | `/api/transactions` | Crear (actualiza balance) |
| PUT | `/api/transactions/:id` | Editar (recalcula balance) |
| DELETE | `/api/transactions/:id` | Eliminar (revierte balance) |

**Query params para GET /api/transactions:**
- `accountId`, `categoryId`, `type` (INCOME|EXPENSE|TRANSFER)
- `dateFrom`, `dateTo` (ISO 8601)
- `limit` (default 20, max 100), `offset` (default 0)

### Budgets `🔒`
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/budgets` | Listar con gasto actual del período |
| GET | `/api/budgets/:id` | Detalle con spending |
| POST | `/api/budgets` | Crear presupuesto |
| PUT | `/api/budgets/:id` | Editar |
| DELETE | `/api/budgets/:id` | Eliminar |

### Savings Goals `🔒`
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/savings` | Listar metas con % progreso |
| GET | `/api/savings/:id` | Detalle |
| POST | `/api/savings` | Crear meta |
| PUT | `/api/savings/:id` | Editar / actualizar amount |
| DELETE | `/api/savings/:id` | Eliminar |

### Reports `🔒`
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/reports/summary` | Balance total + ingresos/gastos del mes |
| GET | `/api/reports/by-category` | Gastos por categoría (`?dateFrom=&dateTo=`) |
| GET | `/api/reports/monthly-trend` | Ingresos vs gastos últimos 6 meses |
| GET | `/api/reports/account-balances` | Balance de cada cuenta |

---

## Formato de respuestas

Todas las respuestas siguen el mismo formato:

```json
// Éxito
{ "success": true, "data": { ... }, "message": "..." }

// Error
{ "success": false, "message": "...", "errors": [...] }
```

## Autenticación

Todos los endpoints marcados con `🔒` requieren:

```
Authorization: Bearer <access_token>
```

**Flujo de tokens:**
1. `POST /api/auth/login` → recibe `accessToken` (15min) + `refreshToken` (7d)
2. Cuando el access token expira → `POST /api/auth/refresh` con `{ refreshToken }`
3. Al cerrar sesión → `POST /api/auth/logout` con el access token en el header

## Lógica de balances

Las transacciones modifican los balances de cuenta de forma atómica (Prisma transaction):

- `INCOME` → incrementa balance de `accountId`
- `EXPENSE` → decrementa balance de `accountId`
- `TRANSFER` → decrementa `accountId`, incrementa `toAccountId`

Al editar o eliminar una transacción, el efecto anterior se revierte antes de aplicar el nuevo.

## Herramientas de desarrollo

| Herramienta | URL |
|------------|-----|
| pgAdmin | http://localhost:5050 (admin@admin.com / admin) |
| Prisma Studio | `npm run db:studio` → http://localhost:5555 |

## Variables de entorno

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/money_minder?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="..."
JWT_REFRESH_SECRET="..."
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="development"
```
