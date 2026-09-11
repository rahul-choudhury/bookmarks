# Bookmarks

A simple private library for saved links. Built with Next.js, React, SQLite via `better-sqlite3`, and `@rahul-choudhury/ui`.

## Run locally

Use Node.js 22.13+ (Node.js 24 LTS recommended) and Bun as the package manager. The application and database scripts run on Node, not the Bun runtime.

```sh
bun install
bun run db:migrate
bun run dev
```

Open http://localhost:3000. Sign in with an email code or a registered passkey. Configure authentication as described below. SQLite defaults to `./data/bookmarks.db`; optionally set `SQLITE_PATH` to an absolute path in `.env.development.local` or the process environment. The data directory is created automatically and ignored by Git.

## Using the library

- **Add link** opens a form for a URL and optional title. Missing schemes default to HTTPS. Page metadata is optional and bounded by a three-second deadline.
- Rows show the OG image when available, falling back to the favicon and then a generic icon. Existing links can be refreshed with `node --import tsx scripts/refresh-previews.ts`.
- All, Unread, and Read tabs filter the library. New and existing bookmarks start unread; use the eye/eye-off icon to toggle reading status. Read titles are visually quieter.
- Search filters titles and URLs within the selected tab. Search never adds links.
- Hover or focus a row to reveal read, edit, and delete actions. The top-left checkbox enters selection mode; batch controls replace the toolbar without moving the list. Touch devices show these controls directly.
- Lists show up to 10 links per page. Selections persist across pages; “Select this page” affects only the current page. Changing search or tabs clears selection. Batch deletion confirms the selected titles.
- Standard Tab, Enter, and Escape behavior is preserved. A opens Add link when not typing in a field.

## Authentication

Better Auth provides email OTP signup/sign-in and passkeys only. Each account has a private library; every read and mutation checks the session and owner. Account controls let users register/remove passkeys and sign out. Register a passkey after signing in with an email code. On later visits, compatible browsers automatically offer a saved passkey through conditional WebAuthn autofill while leaving email sign-in usable.

Configure `.env.development.local` locally and your deployment environment in production:

- `BETTER_AUTH_SECRET`: random secret of at least 32 characters (`openssl rand -base64 32`).
- `BETTER_AUTH_URL`: exact app origin, such as `http://localhost:3000` or your HTTPS production URL. Passkeys are bound to this hostname.
- `RESEND_API_KEY`: Resend API key.
- `AUTH_EMAIL_FROM`: sender address on a domain verified in Resend.

Run `bun run db:migrate` before using auth. Email codes expire after five minutes, allow three attempts, and are hashed in storage. Actual email and device passkey verification require configured delivery and a compatible browser. Passkeys require HTTPS outside localhost.

## Database and deployment

Run one Node application instance with a persistent local disk. Mount the data directory outside the application release directory and set `SQLITE_PATH` to that location. An ephemeral serverless filesystem is not a persistence solution.

```sh
bun run db:migrate    # Apply migrations; safe to rerun
bun run typecheck
bun run lint
bun run test
bun run build
bun run start
```

Run production migrations with `NODE_ENV=production` and the same `SQLITE_PATH` as the application before starting it. Development and production can use different paths. Add numbered `.sql` files to `migrations/sqlite` for schema changes. The raw SQL runner tracks applied files and checksums in `schema_migrations`; existing migration history is adopted automatically.

The database enables WAL, foreign keys, and a five-second busy timeout. Bookmark IDs are UUID strings; timestamps store milliseconds since the Unix epoch. URLs are unique within each account’s library.

SQLite migrations are retained for upgrades and fresh installations. No PostgreSQL service or ORM is used.

## Backup and restore

```sh
bun run db:backup
# Or choose a destination:
bun run db:backup /path/to/backups/bookmarks.db
```

This uses SQLite's online backup API, including committed changes still in the WAL. Store scheduled backups on a separate persistent destination. To restore, stop the app, move the current database and its `-wal`/`-shm` files aside, copy a backup to `SQLITE_PATH`, and restart. Do not replace an open database. Automated tests open the backup and verify its contents and integrity.

## Dependencies

Package versions are recorded in `package.json` and `bun.lock`. TypeScript is pinned to version 6 for compatibility with the TypeScript ESLint parser. ESLint uses `@eslint/compat` for legacy plugin APIs.
