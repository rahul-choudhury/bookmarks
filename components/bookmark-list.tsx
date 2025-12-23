"use client";

import { useActionState, useRef, useState } from "react";
import { useBookmarks } from "@/components/providers/bookmarks-provider";
import { deleteBookmark, importBookmarks, updateName } from "@/lib/actions";
import { Bookmark } from "@/lib/db/bookmarks";
import { isUrl } from "@/lib/utils";

export function BookmarkList() {
  const { bookmarks, searchTerm } = useBookmarks();

  if (bookmarks.length === 0 && searchTerm.trim()) {
    return <SearchResultPrompt searchTerm={searchTerm} />;
  }

  if (bookmarks.length === 0) {
    return <ImportBookmarks />;
  }

  return (
    <ul className="space-y-2 text-sm">
      {bookmarks.map((bookmark) => (
        <BookmarkItem key={bookmark.id} bookmark={bookmark} />
      ))}
    </ul>
  );
}

function SearchResultPrompt({ searchTerm }: { searchTerm: string }) {
  return (
    <div className="py-8 text-center text-sm text-gray-500 md:text-base">
      <p>No results found for &quot;{searchTerm}&quot;</p>
      {isUrl(searchTerm) && (
        <p className="mt-2 text-sm">
          Press{" "}
          <kbd className="rounded border border-gray-300 bg-gray-100 px-2 py-1 text-xs">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-1 inline-block"
            >
              <path d="M20 4v7a4 4 0 0 1-4 4H4" />
              <path d="m9 10-5 5 5 5" />
            </svg>
            Enter
          </kbd>{" "}
          to add this link to your bookmarks
        </p>
      )}
    </div>
  );
}

function ImportBookmarks() {
  const [state, action, isPending] = useActionState(importBookmarks, null);
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-12">
      <div className="text-center">
        <p className="text-base font-medium text-gray-900">No bookmarks yet</p>
        <p className="mt-1 text-sm text-gray-500">
          Do you want to import any previously exported bookmarks?
        </p>
      </div>
      <button
        className="relative flex h-8 items-center gap-2 border border-gray-300 px-3 py-1 ring-offset-2 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
        onClick={() => ref.current?.click()}
        disabled={isPending}
      >
        <svg
          className={`h-4 w-4 text-gray-700 ${isPending ? "animate-spin" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        <span className="text-sm">
          {isPending ? "Importing..." : "Import Bookmarks"}
        </span>
        <form action={action}>
          <input
            ref={ref}
            name="json"
            type="file"
            accept="application/JSON"
            onChange={(e) => e.currentTarget.form?.requestSubmit()}
            disabled={isPending}
            hidden
          />
        </form>
      </button>
      {state && !state.success && state.message && (
        <p className="text-sm text-red-500">{state.message}</p>
      )}
    </div>
  );
}

function BookmarkItem({ bookmark }: { bookmark: Bookmark }) {
  const { isManaging, updateOptimisticBookmark, deleteOptimisticBookmark } =
    useBookmarks();
  const { id, url, title, favicon, timeStamp } = bookmark;

  const isOptimistic = "optimistic" in bookmark;
  const [isEditing, setIsEditing] = useState(false);

  return (
    <li
      className="flex h-8 items-center gap-3"
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
      <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
        {isEditing ? (
          <input
            autoFocus
            className="h-8 w-full border border-gray-300 p-1 ring-offset-2 focus:ring-2 focus:ring-gray-500 focus:outline-none"
            defaultValue={title || url}
            onBlur={async (e) => {
              const newTitle = e.currentTarget.value;

              if (newTitle === bookmark.title) {
                setIsEditing(false);
                return;
              }

              updateOptimisticBookmark(id, newTitle);
              setIsEditing(false);
              await updateName(id, newTitle);
            }}
            onKeyDown={async (e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const newTitle = e.currentTarget.value;
                updateOptimisticBookmark(id, newTitle);
                setIsEditing(false);
                await updateName(id, newTitle);
              }
            }}
          />
        ) : (
          <a
            href={url}
            target="_blank"
            className="max-w-137.5 truncate hover:underline"
          >
            {title || url}
          </a>
        )}
        <p className="hidden text-xs text-gray-500 md:block">
          [{new URL(url).hostname}]
        </p>
      </div>
      <p className="hidden shrink-0 text-gray-500 md:block">
        {new Date(timeStamp).toLocaleDateString("en-IN")}
      </p>

      {isManaging && !isOptimistic && (
        <div className="flex shrink-0 items-center gap-1">
          <button
            className="flex h-7 w-7 items-center justify-center border border-gray-200 p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            aria-label="Edit bookmark"
            onClick={() => setIsEditing((prev) => !prev)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
              <path d="m15 5 4 4" />
            </svg>
          </button>
          <button
            className="flex h-7 w-7 items-center justify-center border border-gray-200 p-1 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
            aria-label="Delete bookmark"
            onClick={async () => {
              deleteOptimisticBookmark(id);
              await deleteBookmark(id);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              <path d="M3 6h18" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      )}
    </li>
  );
}
