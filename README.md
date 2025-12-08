# Bookmarks

A minimalist bookmark manager built with **Next.js 16**, **React 19**, **Drizzle ORM**, and **Better Auth**.

https://github.com/user-attachments/assets/ff8efd50-ed2c-4ae7-bee7-8a5d25d4e371

## Installation

```bash
# Install dependencies
bun install

# Copy environment variables
cp .env.sample .env.development.local

# Start development server
bun dev
```

## Neon Postgres Setup

1. Create a new project on [Neon](https://neon.tech).
2. Copy the **Postgres Connection String**.
3. Paste it into your `.env.development.local` file:
   ```env
   DATABASE_URL=postgres://user:password@host/dbname?sslmode=require
   ```
4. Add your **Better Auth** and **OAuth** credentials to `.env.development.local` (GitHub/Google).

## Database Management

### Development

Use `push` for rapid prototyping. This modifies the database schema directly without creating migration files.

```bash
bun run db:push
```

### Production

Use `migrations` for safe, version-controlled schema changes.

```bash
# 1. Generate migration files based on schema changes
bun run db:generate

# 2. Apply migrations to the production database
bun run db:migrate
```
