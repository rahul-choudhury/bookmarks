"use client";

import * as React from "react";
import type { Bookmark } from "@/lib/db/schema";

type BookmarksContextType = {
  bookmarks: Bookmark[];
  setSearchTerm: (term: string) => void;
  addOptimisticBookmark: (bookmark: Bookmark) => void;
};

export const BookmarksContext =
  React.createContext<BookmarksContextType | null>(null);

export function BookmarksProvider({
  children,
  initialBookmarks,
}: {
  children: React.ReactNode;
  initialBookmarks: Bookmark[];
}) {
  const [optimisticBookmarks, addOptimisticBookmark] = React.useOptimistic(
    initialBookmarks,
    (state, newBookmark: Bookmark) => [
      { ...newBookmark, optimistic: true },
      ...state,
    ],
  );

  const [searchTerm, setSearchTerm] = React.useState("");

  const bookmarks = React.useMemo(() => {
    if (!searchTerm.trim()) {
      return optimisticBookmarks;
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    return optimisticBookmarks.filter((bookmark) => {
      const titleMatch = bookmark.title
        ?.toLowerCase()
        .includes(lowerCaseSearchTerm);
      const urlMatch = bookmark.url
        ?.toLowerCase()
        .includes(lowerCaseSearchTerm);
      return titleMatch || urlMatch;
    });
  }, [searchTerm, optimisticBookmarks]);

  return (
    <BookmarksContext
      value={{ bookmarks, setSearchTerm, addOptimisticBookmark }}
    >
      {children}
    </BookmarksContext>
  );
}

export function useBookmarks() {
  const context = React.useContext(BookmarksContext);
  if (!context) {
    throw new Error("useBookmarks must be used within BookmarksProvider");
  }
  return context;
}
