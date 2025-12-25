"use client";

import * as React from "react";
import type { Bookmark } from "@/lib/db/bookmarks";
import { transformUrl } from "@/lib/utils";
import { useRouter } from "next/navigation";

type BookmarksContextType = {
  bookmarks: Bookmark[];
  searchTerm: string;
  isManaging: boolean;
  setIsManaging: React.Dispatch<React.SetStateAction<boolean>>;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  addOptimisticBookmark: (bookmark: Bookmark) => void;
  updateOptimisticBookmark: (id: string, title: string) => void;
  deleteOptimisticBookmark: (id: string) => void;
};

export const BookmarksContext =
  React.createContext<BookmarksContextType | null>(null);

type Action =
  | { type: "ADD"; bookmark: Bookmark }
  | { type: "UPDATE"; id: string; title: string }
  | { type: "DELETE"; id: string };

export function BookmarksProvider({
  children,
  initialBookmarks,
}: {
  children: React.ReactNode;
  initialBookmarks: Bookmark[];
}) {
  const router = useRouter();

  const hasPendingMetadata = React.useMemo(() => {
    return initialBookmarks.some((b) => !b.title);
  }, [initialBookmarks]);

  React.useEffect(() => {
    if (!hasPendingMetadata) return;

    const interval = setInterval(() => {
      router.refresh();
    }, 1000);

    return () => clearInterval(interval);
  }, [hasPendingMetadata, router]);

  const [optimisticBookmarks, dispatchOptimistic] = React.useOptimistic(
    initialBookmarks,
    (state, action: Action) => {
      switch (action.type) {
        case "ADD":
          return [action.bookmark, ...state];
        case "UPDATE":
          return state.map((item) =>
            item.id === action.id ? { ...item, title: action.title } : item,
          );
        case "DELETE":
          return state.filter((item) => item.id !== action.id);
      }
    },
  );

  const addOptimisticBookmark = (bookmark: Bookmark) => {
    React.startTransition(() => {
      dispatchOptimistic({ type: "ADD", bookmark });
    });
  };

  const updateOptimisticBookmark = (id: string, title: string) => {
    React.startTransition(() => {
      dispatchOptimistic({ type: "UPDATE", id, title });
    });
  };

  const deleteOptimisticBookmark = (id: string) => {
    React.startTransition(() => {
      dispatchOptimistic({ type: "DELETE", id });
    });
  };

  const [isManaging, setIsManaging] = React.useState(false);
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
      value={{
        bookmarks,
        searchTerm,
        isManaging,
        setIsManaging,
        setSearchTerm,
        addOptimisticBookmark,
        updateOptimisticBookmark,
        deleteOptimisticBookmark,
      }}
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
