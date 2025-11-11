"use client";

import {
  createContext,
  useContext,
  useOptimistic,
  startTransition,
} from "react";
import type { Bookmark } from "@/lib/db/schema";

type BookmarksContextType = {
  bookmarks: Bookmark[];
  addOptimisticBookmark: (bookmark: Bookmark) => void;
};

const BookmarksContext = createContext<BookmarksContextType | null>(null);

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
    ]
  );

  const handleAddOptimistic = (bookmark: Bookmark) => {
    startTransition(() => {
      addOptimisticBookmark(bookmark);
    });
  };

  return (
    <BookmarksContext.Provider
      value={{
        bookmarks: optimisticBookmarks,
        addOptimisticBookmark: handleAddOptimistic,
      }}
    >
      {children}
    </BookmarksContext.Provider>
  );
}

export function useBookmarks() {
  const context = useContext(BookmarksContext);
  if (!context) {
    throw new Error("useBookmarks must be used within BookmarksProvider");
  }
  return context;
}
