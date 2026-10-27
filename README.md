# Kenlivo Server

E-commerce REST API — TypeScript, Express 5, MongoDB/Mongoose, JWT auth.

## Stack & structure

```
src/
  config/        env validation (zod), db connection, logger
  middlewares/   auth (JWT), authorize (roles), validate (zod), error handler
  modules/
    auth/        register, login, refresh, logout, me
    user/        User model (bcrypt, roles: customer | admin)
    category/    CRUD (public read, admin write)
    product/     CRUD + search/filter/sort/paginate
    cart/        per-user cart
    order/       checkout with transactional stock decrement, status, cancel
  routes/        versioned router mount (/api/v1)
  utils/         AppError, catchAsync, jwt, queryBuilder, sendResponse
  scripts/       seed.ts
```

## Environments

Config is loaded from `.env.<NODE_ENV>` then `.env`. Three files:

- `.env.example` — committed template (copy to create the others).
- `.env.development` — local (Docker) values; **git-ignored**.
- `.env.production` — prod values / secret-manager placeholders; **git-ignored**.

Backend listens on **port 7000**.

## Running

### Local (Docker — API + MongoDB + Mongo Express)
```bash
docker compose up --build
# API        → http://localhost:7000/api/v1
# Mongo       → localhost:27017  (root / example)
# Mongo Express → http://localhost:8081
```

### Local (without Docker)
```bash
cp .env.example .env.development   # point MONGODB_URI at localhost
npm install
npm run dev      # tsx watch
npm run seed     # admin@kenlivo.com / Admin@123 + sample catalog
```

### Production
```bash
# set real MONGODB_URI + JWT secrets in .env.production
docker compose -f docker-compose.prod.yml up -d --build
# or, bare:
npm run build && npm start
```

## API (base `/api/v1`)

| Method | Path | Auth |
| --- | --- | --- |
| POST | `/auth/register` | public |
| POST | `/auth/login` | public |
| POST | `/auth/refresh` | cookie/body refresh token |
| POST | `/auth/logout` | public |
| GET | `/auth/me` | bearer |
| GET | `/categories`, `/categories/:id` | public |
| POST/PATCH/DELETE | `/categories…` | admin |
| GET | `/products`, `/products/:id` | public |
| POST/PATCH/DELETE | `/products…` | admin |
| GET/POST/PATCH/DELETE | `/cart…` | customer |
| POST | `/orders` | customer (checkout) |
| GET | `/orders/me`, `/orders/:id` | customer (own) |
| PATCH | `/orders/:id/cancel` | owner/admin |
| GET | `/orders` | admin |
| PATCH | `/orders/:id/status` | admin |

Products list supports `?search=&category=&sort=-price&page=1&limit=20&price[gte]=10`.

All responses use a uniform envelope: `{ success, message, data, meta? }`.
