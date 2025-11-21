Next.js 16 + React 19 bookmark manager with PostgreSQL (Drizzle ORM), Better Auth (GitHub OAuth), and optimistic UI.

## Commands

```bash
bun dev              # Start dev server
bun run build        # Production build
bun run db:push      # Push schema to DB (dev)
bun run db:migrate   # Run migrations
```

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` - OAuth credentials
- `BETTER_AUTH_SECRET` - Session encryption key

## Core Architecture

**Database** (`lib/db/schema.ts`, `auth-schema.ts`):

- Bookmarks table: `id`, `url`, `title`, `favicon`, `timeStamp`, `userId` (FK to user, CASCADE delete)
- Auth tables: user, session, account, verification (managed by Better Auth)
- Connection pool: `lib/db/index.ts`

**Authentication**:

- Better Auth config: `lib/auth.ts` (server), `lib/auth-client.ts` (client)
- Auth middleware: `proxy.ts` redirects unauthenticated users to `/login`
- API route: `app/api/auth/[...all]/route.ts`

**State Management** (`components/providers/bookmarks-provider.tsx`):

- React 19 `useOptimistic` for instant bookmark updates
- Manages `searchTerm` (case-insensitive filtering on title/URL)
- Manages `isManaging` (toggle edit/delete UI)
- Exports `useBookmarks` hook

**Server Actions** (`lib/actions.ts`):

- `saveLinkToDB` - Validates session, unfurls URL metadata via `unfurl.js`, saves with userId, revalidates
- `deleteBookmark` - Validates session + ownership, deletes, revalidates

## Key Files

- `app/page.tsx` - Fetches user bookmarks server-side, wraps with BookmarksProvider
- `components/search-bar.tsx` - Dual-purpose: search or add URL (Enter to submit, `/` to focus)
- `components/bookmark-list.tsx` - Displays filtered bookmarks, shows edit/delete in management mode
- `components/title-bar.tsx` - "Manage/Done" toggle button
- `app/login/page.tsx` - GitHub OAuth login

## Data Flow

1. `app/page.tsx` fetches bookmarks (filtered by userId)
2. `components/search-bar.tsx` universal search bar to search bookmarks and add bookmarks.
3. User enters URL in SearchBar → `saveLinkToDB` → unfurls metadata → DB insert
4. Optimistic update shows bookmark immediately (50% opacity)
5. `revalidatePath("/")` syncs server state

## Tech Notes

- React 19 hooks: `useOptimistic`, `useActionState`
- TypeScript path alias: `@/*` → project root
- Tailwind CSS v4 for styling
- All queries scoped by userId for security
