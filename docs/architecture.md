# Architecture

## Database

Schema files: `lib/db/bookmarks.ts`, `auth-schema.ts`

| Table                                | Key Columns                                                                 |
| ------------------------------------ | --------------------------------------------------------------------------- |
| bookmarks                            | `id`, `url`, `title`, `favicon`, `timeStamp`, `userId` (FK, CASCADE delete) |
| user, session, account, verification | Managed by Better Auth                                                      |

Connection pool: `lib/db/index.ts`

## Authentication

- Server config: `lib/auth.ts` (GitHub + Google OAuth)
- Client config: `lib/auth-client.ts`
- Middleware: `proxy.ts` redirects unauthenticated users to `/login`
- API route: `app/api/auth/[...all]/route.ts`

## State Management

File: `components/providers/bookmarks-provider.tsx`

- Uses React 19 `useOptimistic` reducer for instant updates
- Optimistic actions: `ADD`, `REPLACE`, `UPDATE`, `DELETE`
- Fuzzy search on title with ranked results (see `fuzzyMatch`)
  - Exact substring matches are detected first and scored highest
  - Fuzzy fallback matches characters in order, scoring consecutive and word-boundary hits higher
  - Tightness bonus rewards matches clustered together over scattered ones
  - Matched character indices are exposed via `matchIndicesMap` for highlight rendering
- Manages `isManaging` (toggle edit/delete UI)
- Exports `useBookmarks` hook

## Server Actions

File: `lib/actions.ts`

| Action            | Behavior                                                       |
| ----------------- | -------------------------------------------------------------- |
| `saveLinkToDB`    | Validates session, saves, fetches metadata inline, revalidates |
| `deleteBookmark`  | Validates session + ownership, deletes, revalidates            |
| `updateName`      | Validates session + ownership, updates title, revalidates      |
| `importBookmarks` | Validates session, parses JSON file, bulk inserts bookmarks    |
