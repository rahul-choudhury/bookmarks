"use client";

import { createContext, useContext, useOptimistic } from "react";
import type { Bookmark } from "@/lib/db/schema";

type BookmarksContextType = {
  bookmarks: Bookmark[];
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
      ...state,
      { ...newBookmark, optimistic: true },
    ],
  );

  return (
    <BookmarksContext
      value={{
        bookmarks: optimisticBookmarks,
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
