import { requireUser } from "@/lib/session";
import { BookmarkLibrary } from "@/components/bookmark-library";
import { getDb } from "@/lib/db";
import { bookmarkColumns, type BookmarkRow } from "@/lib/db/bookmarks";

export const dynamic = "force-dynamic";
export default async function Home() {
  const user = await requireUser();
  const bookmarks = getDb()
    .prepare<[string], BookmarkRow>(
      `SELECT ${bookmarkColumns} FROM bookmarks WHERE user_id = ? ORDER BY "timeStamp" DESC, id DESC`,
    )
    .all(user.id)
    .map((row) => ({ ...row, timeStamp: new Date(row.timeStamp) }));
  return <BookmarkLibrary bookmarks={bookmarks} userEmail={user.email} />;
}
