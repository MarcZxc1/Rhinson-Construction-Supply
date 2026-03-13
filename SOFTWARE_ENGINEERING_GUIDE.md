# Rhinson Construction Supply - Software Engineering Guide

This guide explains the project in a way that an average student can understand.

## 1. What This Software Is

Rhinson Construction Supply is a full-stack web application for managing a construction supply business.

Current state:
- Backend (API) is actively implemented for user authentication and user account management.
- Database schema already includes inventory and order management models.
- Frontend is still in starter/template state and not yet connected to backend features.

In simple terms:
- `frontend/` is what users see.
- `server/` is the brain (business logic + API).
- PostgreSQL stores data.
- Redis is prepared for caching/session-related features.

## 2. High-Level Architecture

```text
[ React Frontend ]
        |
        | HTTP requests (JSON)
        v
[ Express API Server ] ---> [ Prisma ORM ] ---> [ PostgreSQL ]
        |
        +-------------------------------------> [ Redis (planned/infra-ready) ]
```

Core architectural style:
- Monorepo with two main apps: frontend + backend.
- Layered backend architecture:
  - Routes layer (API endpoints)
  - Controller layer (request/response handling)
  - Service layer (business logic)
  - Data layer (Prisma + PostgreSQL)

## 3. Workspace Folder Structure

```text
Rhinson Construction Supply/
  docker-compose.yml
  frontend/
  server/
```

### `docker-compose.yml`
Purpose:
- Starts local infrastructure and apps using containers.

Services:
- `db`: PostgreSQL database
- `redis`: Redis server
- `server`: Node + Express backend
- `frontend`: Vite React frontend

Why this matters for engineering:
- Reproducible local development environment.
- Easier onboarding for new developers.

### `frontend/`
Purpose:
- Client-side user interface (React + TypeScript + Vite).

Important files:
- `frontend/src/main.tsx`: React app entry point.
- `frontend/src/App.tsx`: Main UI component (currently starter example).
- `frontend/src/index.css`, `frontend/src/App.css`: Styling.
- `frontend/package.json`: Frontend scripts and dependencies.

Current reality:
- Dependencies suggest future architecture (`react-router-dom`, `react-query`, `axios`, `react-helmet-async`),
  but current UI is still the default Vite starter screen.

### `server/`
Purpose:
- REST API backend for authentication and domain logic.

Important files and folders:
- `server/src/index.ts`: Server startup (creates HTTP server and listens on `PORT`).
- `server/src/app.ts`: Express app setup and middleware registration.
- `server/src/routes/`: API endpoint definitions.
- `server/src/controller/`: Controller classes (handles HTTP-level behavior).
- `server/src/service/`: Core business logic.
- `server/src/middleware/`: Reusable request pipeline logic (JWT, validation, error handling).
- `server/src/types/`: TypeScript interfaces/types.
- `server/src/utils/`: Shared utilities (Prisma client, schemas, logger).
- `server/prisma/schema.prisma`: Database schema models and enums.
- `server/prisma/migrations/`: Versioned database changes.
- `server/request.http`: API request samples for manual testing.

## 4. Backend Code Flow (Step by Step)

Example: user login.

1. Client sends `POST /api/users/login`.
2. Route in `server/src/routes/user.routes.ts` matches endpoint.
3. `validateRequest(loginSchema)` checks request body shape with Zod.
4. `UserController.login` in `server/src/controller/user.controller.ts` runs.
5. Controller calls `UserService.login` in `server/src/service/user.service.ts`.
6. Service:
   - Finds user by email from database via Prisma.
   - Verifies password using `argon2`.
   - Generates JWT token using `jsonwebtoken`.
7. Controller sends JSON response containing user summary + token.

Example: protected route `GET /api/users/profile`.

1. Request includes `Authorization: Bearer <token>`.
2. `authenticate` middleware in `server/src/middleware/jwt.middleware.ts` verifies token.
3. Decoded user info is attached to `req.user`.
4. Controller reads `req.user.id`, gets full profile from service, and returns it.

## 5. Why the Backend Structure Is Good Engineering

Good practices already present:
- Separation of concerns:
  - Routes define API mapping.
  - Controllers handle HTTP concerns.
  - Services handle business logic.
- Validation with Zod before logic runs.
- Centralized error handling with custom `AppError`.
- Password hashing (argon2) instead of storing plain text passwords.
- Soft delete approach for users (`isActive = false`) to preserve records.

Areas that can be improved:
- Environment variable naming consistency (`JWT_SECRET` is used in code; `.env` currently has `JWT`).
- Some response fields/messages have typos or small inconsistencies.
- Frontend is not yet integrated with API.

## 6. Database Design (Prisma)

Main models in `server/prisma/schema.prisma`:
- `User`: account info, role, active status.
- `Category`: product grouping.
- `Product` (mapped to `inventory`): stock item details.
- `Order`: transaction header with status and logistics data.
- `OrderItem`: line items for each order.

Key idea for students:
- Prisma schema is the source of truth for database structure.
- Migrations in `server/prisma/migrations/` are the history of schema changes.
- This gives traceability: you can see how the database evolved over time.

## 7. Current API Endpoints (Implemented)

From `server/src/routes/user.routes.ts`:
- Public:
  - `POST /api/users/register`
  - `POST /api/users/login`
- Protected:
  - `GET /api/users/profile`
  - `PATCH /api/users/:id`
  - `DELETE /api/users/:id` (soft delete)

Health check:
- `GET /health`

## 8. Development Workflow

Backend commands (`server/package.json`):
- `npm run dev`: start backend with hot reload (`tsx watch`).
- `npm run build`: generate Prisma client and compile TypeScript.
- `npm run start`: run compiled server.
- `npm run prisma:migrate`: create/apply database migrations.

Frontend commands (`frontend/package.json`):
- `npm run dev`: run Vite dev server.
- `npm run build`: TypeScript build + Vite build.
- `npm run lint`: lint source code.

## 9. Upcoming Development Roadmap

### Phase 1: Stabilize Existing User Module (short-term)
- Align env vars (`JWT_SECRET`) and secure secrets.
- Add automated tests for auth and user routes.
- Improve API response consistency and error message quality.
- Add request logging and production-ready monitoring hooks.

### Phase 2: Build Real Frontend Features
- Replace Vite starter UI with actual pages:
  - Login/Register
  - User Profile
  - Admin User Management
- Add API client layer with Axios.
- Use React Query for server-state caching and mutations.
- Add route protection (private routes).

### Phase 3: Inventory and Category Module
- Implement backend CRUD routes/services/controllers for:
  - Categories
  - Products
- Add stock update operations and validation rules.
- Build frontend inventory screens.

### Phase 4: Order and Logistics Module
- Create order endpoints and business rules.
- Implement order item processing and total calculations.
- Add fulfillment workflows (pickup/delivery).
- Add order status tracking in UI.

### Phase 5: Performance, Security, and Operations
- Integrate Redis for caching/rate limiting/session patterns.
- Add `helmet`, stricter CORS config, and API rate limits.
- Introduce CI pipeline for lint, test, and build checks.
- Add backup strategy and deployment documentation.

## 10. Suggested Learning Path for a Student

If you want to learn software engineering from this codebase, follow this order:
1. Read `server/src/app.ts` and understand middleware ordering.
2. Trace one endpoint from route -> controller -> service -> database.
3. Study `server/prisma/schema.prisma` to connect code with data design.
4. Run API requests from `server/request.http` and inspect responses.
5. Build one frontend page that calls one backend endpoint.
6. Add tests for that feature.

This is exactly how real teams grow production systems: one vertical slice at a time.

## 11. Summary

This project already has a strong backend foundation for user management and a forward-looking database design for inventory and order processing. The next major milestone is to connect and expand the frontend, then implement the remaining domain modules (inventory/orders), followed by production hardening.

## 12. How to Implement the Libraries in This Project

This section shows how to actually use the key libraries that are already installed.

### Backend Libraries (`server/package.json`)

#### `express`
What it is for:
- Build REST APIs and middleware pipelines.

How to implement:
1. Create route files in `server/src/routes/`.
2. Register routes in `server/src/app.ts` using `app.use('/api/...', router)`.
3. Keep business logic out of routes; call service classes from controllers.

Current example:
- `server/src/app.ts`
- `server/src/routes/user.routes.ts`

#### `zod`
What it is for:
- Runtime request validation for body/params/query.

How to implement:
1. Add schemas in `server/src/utils/zodSchema.ts`.
2. Apply schema with `validateRequest(schema)` middleware in route definitions.
3. Return consistent validation errors from `validateRequest.ts`.

Pattern:
```ts
router.post('/register', validateRequest(registerSchema), controller.register)
```

#### `jsonwebtoken`
What it is for:
- Create and verify authentication tokens.

How to implement:
1. Generate token in login flow (`UserService.login`).
2. Verify token in `authenticate` middleware.
3. Attach decoded payload to `req.user`.
4. Protect routes by placing `authenticate` before controller handlers.

Important:
- Use `JWT_SECRET` in `.env` and never hardcode secrets.

#### `argon2`
What it is for:
- Secure password hashing.

How to implement:
1. Hash password on user creation/update:
   - `argon2.hash(password)`
2. Verify password on login:
   - `argon2.verify(storedHash, inputPassword)`

Never store plain text passwords.

#### `@prisma/client` + `prisma`
What it is for:
- Typed database access and schema migrations.

How to implement:
1. Define models in `server/prisma/schema.prisma`.
2. Run migration and generate client:
   - `npm run prisma:migrate`
   - `npm run prisma:generate`
3. Use singleton Prisma client from `server/src/utils/prisma.ts`.
4. Keep DB queries in service layer.

Recommended service pattern:
```ts
const user = await prisma.user.findUnique({ where: { id } })
```

#### `dotenv`
What it is for:
- Load environment variables.

How to implement:
1. Keep secrets and config in `server/.env`.
2. Load early in startup (`src/index.ts`):
   - `import 'dotenv/config'`
3. Read via `process.env`.

Use for:
- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `NODE_ENV`

#### `cors`
What it is for:
- Allow frontend origin to call backend.

How to implement:
1. Configure in `server/src/app.ts`.
2. In development, allow Vite host (`http://localhost:5173`).
3. In production, restrict to real frontend domain.

#### `helmet` and `express-rate-limit` (installed, recommended to activate)
What they are for:
- `helmet`: secure HTTP headers.
- `express-rate-limit`: brute-force and abuse protection.

How to implement (in `server/src/app.ts`):
```ts
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

app.use(helmet())
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }))
```

### Frontend Libraries (`frontend/package.json`)

#### `react-router-dom`
What it is for:
- Multi-page app experience in SPA style.

How to implement:
1. Create pages in `frontend/src/pages/`.
2. Define routes in a router component.
3. Wrap app with router provider.

Minimal pattern:
```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'

<BrowserRouter>
  <Routes>
    <Route path='/' element={<HomePage />} />
    <Route path='/login' element={<LoginPage />} />
  </Routes>
</BrowserRouter>
```

#### `axios`
What it is for:
- HTTP client for backend API calls.

How to implement:
1. Create `frontend/src/lib/api.ts` with a configured axios instance.
2. Set `baseURL` (for example `http://localhost:5000/api`).
3. Add token interceptor for protected requests.

Minimal pattern:
```ts
import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api',
})
```

#### `@tanstack/react-query`
What it is for:
- Server-state management, caching, and async status handling.

How to implement:
1. Create one `QueryClient` in `frontend/src/main.tsx`.
2. Wrap app with `QueryClientProvider`.
3. Use `useQuery` for reads and `useMutation` for writes.

Minimal setup:
```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

#### `react-helmet-async`
What it is for:
- Manage page titles/meta tags per route.

How to implement:
1. Wrap app with `HelmetProvider`.
2. Use `<Helmet>` in each page component.

Pattern:
```tsx
<Helmet>
  <title>Login | Rhinson</title>
</Helmet>
```

#### `lucide-react`
What it is for:
- Consistent SVG icons.

How to implement:
1. Import icons directly into components.
2. Keep icon size/colors via CSS classes for consistency.

Pattern:
```tsx
import { User, Lock } from 'lucide-react'
```

### Suggested Implementation Order (Practical)

1. Configure frontend API client (`axios`) and env file (`VITE_API_URL`).
2. Add router (`react-router-dom`) and create Login/Register/Profile pages.
3. Add React Query provider and convert API calls to `useQuery`/`useMutation` hooks.
4. Add JWT storage strategy and axios auth interceptor.
5. Add `HelmetProvider` + per-page SEO titles.
6. Add shared icon system using `lucide-react`.
7. Harden backend with `helmet` and `express-rate-limit`.

### Example Folder Additions for These Libraries

Recommended new frontend structure:

```text
frontend/src/
  app/
    router.tsx
    providers.tsx
  lib/
    api.ts
  features/
    auth/
      api.ts
      hooks.ts
      pages/
        LoginPage.tsx
        RegisterPage.tsx
  components/
    ui/
      TextField.tsx
      Button.tsx
      Icon.tsx
```

Recommended backend additions:

```text
server/src/
  config/
    env.ts
    security.ts
  features/
    auth/
      auth.routes.ts
      auth.controller.ts
      auth.service.ts
      auth.schema.ts
```

These structures are not mandatory, but they scale better as the project grows.
