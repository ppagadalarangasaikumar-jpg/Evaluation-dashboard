# Evaluation Dashboard

A full-stack engineering portfolio dashboard showcasing three backend systems from the evaluation starter: a Vehicle Maintenance Scheduler (knapsack algorithm), a Campus Notification System (priority inbox), and a System Design documentation viewer.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/evaluation-dashboard run dev` — run the React frontend (port 24550)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 (port 8080, path `/api`)
- Frontend: React 19 + Vite + Tailwind CSS + shadcn/ui (port 24550, path `/`)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — Single source of truth for all API contracts
- `lib/db/src/schema/notifications.ts` — Notifications table
- `lib/db/src/schema/depots.ts` — Depots and vehicle_tasks tables
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/evaluation-dashboard/src/pages/` — React pages (Dashboard, VehicleSchedules, Notifications, SystemDesign)
- `lib/api-client-react/src/generated/` — Generated React Query hooks (do not edit)
- `lib/api-zod/src/generated/` — Generated Zod schemas (do not edit)

## Architecture decisions

- OpenAPI-first: all API contracts defined in `lib/api-spec/openapi.yaml`, types and hooks auto-generated
- Knapsack algorithm runs server-side per depot request — no persistence needed for schedule results
- Notifications stored in Postgres with priority ranking computed at query time (type weight + recency sort)
- All notification mutations invalidate the React Query cache for instant UI updates

## Product

Four pages:
- **Dashboard** (`/`) — Live overview stats: depots, tasks, notifications by type, unread count, avg mechanic hours, avg impact score
- **Vehicle Scheduler** (`/vehicle-schedules`) — Per-depot knapsack-optimized maintenance task selection with progress bars and efficiency %
- **Priority Inbox** (`/notifications`) — Full CRUD notification management ranked by Placement > Result > Event with filters and create form
- **System Design** (`/system-design`) — 6-stage tabbed documentation: REST API, DB Schema, Query Optimization, Scaling, Bulk Sending, Priority Inbox

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After any OpenAPI spec change, run `pnpm --filter @workspace/api-spec run codegen` before using updated types
- Body schema component names must NOT match `<OperationIdPascal>Body` — use entity-shaped names (e.g. `NotificationBatch` not `CreateNotificationBody`) to avoid TS2308 collision in api-zod barrel
- Workflow names in restart calls must include the artifact prefix: `artifacts/api-server: API Server`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
