"use client";

import {
  createContext,
  useContext,
  useMemo,
  useOptimistic,
  useState,
} from "react";
import type { Bookmark } from "@/lib/db/schema";

type BookmarksContextType = {
  bookmarks: Bookmark[];
  searchTerm: (term: string) => void;
  addOptimisticBookmark: (bookmark: Bookmark) => void;
};

export const BookmarksContext = createContext<BookmarksContextType | null>(
  null,
);

export function BookmarksProvider({
  children,
  initialBookmarks,
}: {
  children: React.ReactNode;
  initialBookmarks: Bookmark[];
}) {
  const [optimisticBookmarks, addOptimisticBookmark] = useOptimistic(
    initialBookmarks,
    (state, newBookmark: Bookmark) => [
      { ...newBookmark, optimistic: true },
      ...state,
    ],
  );

  const [currSearchTerm, setCurrSearchTerm] = useState("");

  const bookmarks = useMemo(() => {
    if (!currSearchTerm.trim()) {
      return optimisticBookmarks;
    }

    const lowerCaseSearchTerm = currSearchTerm.toLowerCase();
    return optimisticBookmarks.filter((bookmark) => {
      const titleMatch = bookmark.title
        ?.toLowerCase()
        .includes(lowerCaseSearchTerm);
      const urlMatch = bookmark.url
        ?.toLowerCase()
        .includes(lowerCaseSearchTerm);
      return titleMatch || urlMatch;
    });
  }, [currSearchTerm, optimisticBookmarks]);

  return (
    <BookmarksContext
      value={{
        bookmarks,
        searchTerm: (term) => setCurrSearchTerm(term),
        addOptimisticBookmark: (bookmark) => addOptimisticBookmark(bookmark),
      }}
    >
      {children}
    </BookmarksContext>
  );
}

export function useBookmarks() {
  const context = useContext(BookmarksContext);
  if (!context) {
    throw new Error("useBookmarks must be used within BookmarksProvider");
  }
  return context;
}
