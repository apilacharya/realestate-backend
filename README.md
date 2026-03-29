# Real Estate Listings - Backend

REST API built with Express, TypeScript, Prisma, and PostgreSQL.

**Live:** https://realestate-backend-9big.onrender.com

## Prerequisites

- Node.js 18+
- PostgreSQL database (local or hosted, e.g. Supabase)
- pnpm

## Setup

```bash
pnpm install
cp .env.example .env
# Fill in your DATABASE_URL, DIRECT_URL, JWT_SECRET, COOKIE_SECRET
```

### Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 4000) |
| `DATABASE_URL` | PostgreSQL connection string (pooled, for Prisma Client) |
| `DIRECT_URL` | PostgreSQL direct connection (for migrations) |
| `NODE_ENV` | `development` / `production` |
| `JWT_SECRET` | Secret key for signing JWTs |
| `JWT_EXPIRES_IN` | Token expiry (default: `7d`) |
| `COOKIE_SECRET` | Secret for cookie signing |
| `ALLOWED_ORIGINS` | Comma-separated allowed CORS origins (production only) |

## Database

```bash
# Run migrations
pnpm migrate

# Seed the database (creates users, agents, 35 properties)
pnpm seed

# Open Prisma Studio (GUI)
pnpm studio
```

### Seed Data

The seed creates:

- **Admin:** `admin@realestate.com` / `admin123`
- **User:** `use1r@realestate.com` / `User@123`
- 3 agents and 35 property listings with varied types, suburbs, and statuses

### Schema Overview

- **Users** - email, name, password (hashed), role (`USER` | `ADMIN`)
- **Agents** - name, email, phone
- **Properties** - title, description, price, bedrooms, bathrooms, type, suburb, state, address, image, status, internal notes (admin-only), featured flag, agent relation

## Running

```bash
# Development (hot reload)
pnpm dev

# Production build
pnpm build
pnpm start
```

## API

All endpoints are prefixed with `/api`. Auth endpoints are public; listings require authentication via httpOnly cookie.

### Auth

```bash
# Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@test.com", "name": "Test User", "password": "password123"}'

# Login (sets httpOnly cookie)
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email": "user@realestate.com", "password": "user123"}'

# Get current user
curl http://localhost:4000/api/auth/me -b cookies.txt

# Logout
curl -X POST http://localhost:4000/api/auth/logout -b cookies.txt
```

### Listings (requires auth)

```bash
# Get all listings (paginated)
curl "http://localhost:4000/api/listings?page=1&limit=10" -b cookies.txt

# Filter by suburb and price range
curl "http://localhost:4000/api/listings?suburb=Northside&price_min=500000&price_max=1000000" -b cookies.txt

# Filter by property type and bedrooms
curl "http://localhost:4000/api/listings?property_type=house&beds=3&baths=2" -b cookies.txt

# Search by keyword
curl "http://localhost:4000/api/listings?keyword=luxury&sort_by=price_desc" -b cookies.txt

# Get single listing
curl http://localhost:4000/api/listings/1 -b cookies.txt
```

#### Listing Query Parameters

| Param | Type | Description |
|---|---|---|
| `suburb` | string | Filter by suburb (case-insensitive partial match) |
| `price_min` | number | Minimum price |
| `price_max` | number | Maximum price |
| `beds` | number | Minimum bedrooms |
| `baths` | number | Minimum bathrooms |
| `property_type` | `house` `apartment` `townhouse` `land` | Filter by type |
| `keyword` | string | Search title, description, suburb, state, address |
| `status` | `available` `under_offer` `sold` | Filter by status |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10, max: 50) |
| `sort_by` | `price_asc` `price_desc` `newest` | Sort order (default: newest) |

### Response Format

```json
{
  "data": [
    {
      "id": 1,
      "title": "Modern Family Home",
      "price": "750000",
      "bedrooms": 3,
      "bathrooms": 2,
      "propertyType": "house",
      "suburb": "Northside",
      "state": "NSW",
      "status": "available",
      "agent": { "id": 1, "name": "Jane Smith", "email": "jane@realestate.com", "phone": "0400 123 456" },
      "internalNotes": null
    }
  ],
  "meta": { "total": 35, "page": 1, "limit": 10, "total_pages": 4 }
}
```

Admin users see `internalNotes`; regular users get `null`.

## Project Structure

```
backend/
  server.ts              # Entry point
  prisma.config.ts       # Prisma migration/seed config
  prisma/
    schema.prisma        # Database schema
    seed.ts              # Seed script
  src/
    app.ts               # Express app setup (CORS, middleware, routes)
    config/env.ts        # Environment validation (Zod)
    lib/prisma.ts        # Prisma client instance
    middleware/
      auth.ts            # JWT cookie authentication
      requireRole.ts     # Role-based access control
      rateLimiter.ts     # 100 req / 15 min per IP
      errorHandler.ts    # Global error handler
    modules/
      auth/              # Register, login, logout, me
      listings/          # Get all (filtered/paginated), get by ID
```

## Rate Limiting

100 requests per IP per 15-minute window. Returns `429 Too Many Requests` when exceeded.
