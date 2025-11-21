import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { bookmarksTable } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { SearchBar } from "./search-bar";
import { BookmarkList } from "./bookmark-list";
import { BookmarksProvider } from "./bookmarks-provider";

export default async function Home() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) return null;

  const bookmarks = await db
    .select()
    .from(bookmarksTable)
    .where(eq(bookmarksTable.userId, session.user.id));

  return (
    <BookmarksProvider initialBookmarks={bookmarks}>
      <div className="w-full max-w-4xl mx-auto p-8 space-y-4">
        <SearchBar />
        <BookmarkList />
      </div>
    </BookmarksProvider>
  );
}
