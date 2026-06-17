# Data Flow

## Request Lifecycle

1. `app/page.tsx` fetches bookmarks server-side (filtered by userId)
2. User enters a URL or search query in `components/search-bar.tsx`
3. If URL: optimistic update shows bookmark immediately (with URL as temporary title)
4. `saveLinkToDB` inserts to DB, fetches metadata, replaces temp bookmark via `REPLACE`
5. `revalidatePath("/")` syncs server state

## Optimistic Updates

| Action  | Function                    | Behavior                                     |
| ------- | --------------------------- | -------------------------------------------- |
| Add     | `addOptimisticBookmark`     | Immediately shows new bookmark               |
| Replace | `replaceOptimisticBookmark` | Swaps temp bookmark with server-returned one |
| Edit    | `updateOptimisticBookmark`  | Immediately updates title                    |
| Delete  | `deleteOptimisticBookmark`  | Immediately removes from list                |

Updates resolve when server action completes and `revalidatePath("/")` refreshes data.
