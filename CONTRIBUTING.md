# Contributing

Thanks for your interest in contributing to the Evaluation Dashboard!

## Prerequisites

- **Node.js 24+** and **pnpm 10+**
- **PostgreSQL** — connection string in `DATABASE_URL` env var

## Getting Started

```bash
# Install dependencies
pnpm install

# Push database schema
pnpm --filter @workspace/db run push

# Start the API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Start the frontend (port 24550)
pnpm --filter @workspace/evaluation-dashboard run dev
```

## Project Structure

```
artifacts/
  api-server/          # Express 5 backend
  evaluation-dashboard/# React 19 + Vite frontend
lib/
  api-spec/            # OpenAPI spec (source of truth)
  api-client-react/    # Generated React Query hooks
  api-zod/             # Generated Zod schemas
  db/                  # Drizzle ORM schema + migrations
```

## Making Changes

### API changes
1. Edit `lib/api-spec/openapi.yaml` first — it's the single source of truth
2. Run `pnpm --filter @workspace/api-spec run codegen` to regenerate hooks and schemas
3. Update the route handler in `artifacts/api-server/src/routes/`

### Frontend changes
Edit pages in `artifacts/evaluation-dashboard/src/pages/` and components in `src/components/`.

### Database schema changes
1. Edit the schema in `lib/db/src/schema/`
2. Run `pnpm --filter @workspace/db run push` to apply changes in development

## Code Quality

```bash
# Full typecheck across all packages
pnpm run typecheck

# Build everything
pnpm run build
```

All PRs must pass the CI typecheck + build before merging.

## Naming Rules

- OpenAPI body schema component names must **not** match `<OperationIdPascal>Body` — use entity-shaped names (e.g. `NotificationBatch`, not `CreateNotificationBody`) to avoid TypeScript barrel collisions.
