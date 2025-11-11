import { bookmarksTable } from "@/lib/db/schema";
import { SearchBar } from "./search-bar";
import { db } from "@/lib/db";

export default async function Home() {
  const bookmarks = await db
    .select()
    .from(bookmarksTable)
    .orderBy(bookmarksTable.timeStamp);

  return (
    <div className="w-full max-w-4xl mx-auto p-8 space-y-4">
      <SearchBar />
      <ul className="space-y-2 text-sm">
        {bookmarks.map(({ id, url, title, favicon, timeStamp }) => (
          <li key={id} className="flex items-center gap-3">
            {favicon && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={favicon} alt="" className="size-4 shrink-0" />
            )}
            <a className="flex-1 min-w-0" href={url} target="_blank">
              <p className="truncate">{title || url}</p>
              <p className="text-xs text-gray-500 truncate">{url}</p>
            </a>
            <p className="text-gray-500 shrink-0">
              {new Date(timeStamp).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
