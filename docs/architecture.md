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
- Optimistic actions: `ADD`, `UPDATE`, `DELETE`
- Manages `searchTerm` (case-insensitive filtering on title/URL)
- Manages `isManaging` (toggle edit/delete UI)
- Polls `router.refresh()` every 1s while bookmarks have pending metadata (no title)
- Exports `useBookmarks` hook

## Server Actions

File: `lib/actions.ts`

| Action            | Behavior                                                                                           |
| ----------------- | -------------------------------------------------------------------------------------------------- |
| `saveLinkToDB`    | Validates session, saves with null metadata, queues background metadata fetch via `lib/meta-queue` |
| `deleteBookmark`  | Validates session + ownership, deletes, revalidates                                                |
| `updateName`      | Validates session + ownership, updates title, revalidates                                          |
| `importBookmarks` | Validates session, parses JSON file, bulk inserts bookmarks                                        |
