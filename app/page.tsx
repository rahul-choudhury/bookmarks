import { headers } from "next/headers";
import { desc, eq } from "drizzle-orm";
import { bookmarksTable } from "@/lib/db/bookmarks";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { SearchBar } from "@/components/search-bar";
import { BookmarkList } from "@/components/bookmark-list";
import { BookmarksProvider } from "@/components/providers/bookmarks-provider";
import { TitleBar } from "@/components/title-bar";

export default async function Home() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) return null;

  const bookmarks = await db
    .select()
    .from(bookmarksTable)
    .orderBy(desc(bookmarksTable.timeStamp))
    .where(eq(bookmarksTable.userId, session.user.id));

  return (
    <BookmarksProvider initialBookmarks={bookmarks}>
      <div className="w-full max-w-4xl mx-auto p-6 md:p-8 space-y-4">
        <TitleBar />
        <SearchBar />
        <BookmarkList />
      </div>
    </BookmarksProvider>
  );
}
