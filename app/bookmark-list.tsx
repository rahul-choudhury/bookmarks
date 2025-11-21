"use client";

import { useBookmarks } from "./bookmarks-provider";

export function BookmarkList() {
  const { bookmarks } = useBookmarks();
  return (
    <ul className="space-y-2 text-sm">
      {bookmarks.map((bookmark) => {
        const { id, url, title, favicon, timeStamp } = bookmark;
        const isOptimistic = "optimistic" in bookmark;
        return (
          <li
            key={id}
            className="flex items-center gap-3"
            style={{ opacity: isOptimistic ? 0.5 : 1 }}
          >
            <div className="size-4 shrink-0">
              {favicon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={favicon}
                  alt=""
                  className="size-4"
                  onError={(e) => {
                    e.currentTarget.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpath d='M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20'/%3E%3Cpath d='M2 12h20'/%3E%3C/svg%3E";
                  }}
                />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-4 text-gray-400"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                  <path d="M2 12h20" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate">{title || url}</p>
              <p className="text-xs text-gray-500 truncate">{url}</p>
            </div>
            <p className="text-gray-500 shrink-0">
              {new Date(timeStamp).toLocaleDateString("en-IN")}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
