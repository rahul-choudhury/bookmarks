import { bookmarksTable } from "@/lib/db/schema";
import { SearchBar } from "./search-bar";
import { BookmarkList } from "./bookmark-list";
import { BookmarksProvider } from "./bookmarks-provider";
import { db } from "@/lib/db";

export default async function Home() {
  const bookmarks = await db
    .select()
    .from(bookmarksTable)
    .orderBy(bookmarksTable.timeStamp);

  return (
    <BookmarksProvider initialBookmarks={bookmarks}>
      <div className="w-full max-w-4xl mx-auto p-8 space-y-4">
        <SearchBar />
        <BookmarkList />
      </div>
    </BookmarksProvider>
  );
}
