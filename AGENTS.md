Next.js 16 + React 19 bookmark manager with PostgreSQL, Better Auth, and optimistic UI.

## Commands

```bash
bun dev              # Start dev server
bun run build        # Production build
bun run db:push      # Push schema to DB (dev)
bun run db:migrate   # Run migrations
```

## Rules

- **NEVER** run `bun dev` or `bun run build` unless explicitly requested

## Deep Dives

- [Architecture](docs/architecture.md) - Database, auth, state management, server actions
- [Data Flow](docs/data-flow.md) - Request lifecycle, optimistic updates
