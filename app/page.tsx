import { desc, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { BookmarkList } from "@/components/bookmark-list"
import { BookmarksProvider } from "@/components/providers/bookmarks-provider"
import { SearchBar } from "@/components/search-bar"
import { TitleBar } from "@/components/title-bar"
import { getAuth } from "@/lib/auth"
import { getDb } from "@/lib/db"
import { bookmarksTable } from "@/lib/db/bookmarks"

export const dynamic = "force-dynamic"

export default async function Home() {
  const headersList = await headers()
  const session = await getAuth().api.getSession({ headers: headersList })

  if (!session) return null

  const bookmarks = await getDb()
    .select()
    .from(bookmarksTable)
    .orderBy(desc(bookmarksTable.timeStamp))
    .where(eq(bookmarksTable.userId, session.user.id))

  return (
    <BookmarksProvider initialBookmarks={bookmarks}>
      <div className="grid grid-cols-[1fr_minmax(auto,800px)_1fr] gap-x-6 gap-y-4 pb-6 *:col-start-2 *:min-w-0">
        <div className="z-(--z-sticky) bg-bg/95 sticky top-0 space-y-4 pb-2 backdrop-blur-sm">
          <TitleBar />
          <SearchBar />
        </div>
        <BookmarkList />
      </div>
    </BookmarksProvider>
  )
}
