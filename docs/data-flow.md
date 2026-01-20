# Data Flow

## Request Lifecycle

1. `app/page.tsx` fetches bookmarks server-side (filtered by userId)
2. User enters URL in `components/search-bar.tsx` and presses Enter
3. Optimistic update shows bookmark immediately (with URL as temporary title)
4. `saveLinkToDB` inserts to DB with null metadata, queues background fetch
5. `revalidatePath("/")` syncs server state
6. Provider polls `router.refresh()` every 1s until metadata arrives

## Optimistic Updates

| Action | Function                   | Behavior                       |
| ------ | -------------------------- | ------------------------------ |
| Add    | `addOptimisticBookmark`    | Immediately shows new bookmark |
| Edit   | `updateOptimisticBookmark` | Immediately updates title      |
| Delete | `deleteOptimisticBookmark` | Immediately removes from list  |

Updates resolve when server action completes and `revalidatePath("/")` refreshes data.
