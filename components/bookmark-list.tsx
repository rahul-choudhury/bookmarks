"use client";

import { useActionState, useEffect, useRef } from "react";
import { useBookmarks } from "@/components/providers/bookmarks-provider";
import { deleteBookmark, importBookmarks, updateName } from "@/lib/actions";
import { Bookmark } from "@/lib/db/bookmarks";
import { cn, isUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function BookmarkList() {
  const {
    bookmarks,
    searchTerm,
    isManaging,
    selectedIndex,
    setIsManaging,
    setSelectedIndex,
    setEditingId,
    deleteOptimisticBookmark,
  } = useBookmarks();

  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const lastGPressRef = useRef<number>(0);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputFocused =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA";

      if (isInputFocused) return;

      // 'm' to toggle management mode
      if (e.key === "m" && bookmarks.length > 0) {
        e.preventDefault();
        setIsManaging((prev) => !prev);
        return;
      }

      // Escape to exit management mode or clear selection
      if (e.key === "Escape") {
        if (isManaging) {
          setIsManaging(false);
        } else if (selectedIndex !== null) {
          setSelectedIndex(null);
        }
        return;
      }

      // Navigation: j/k or arrow keys
      if (
        (e.key === "j" || e.key === "ArrowDown") &&
        bookmarks.length > 0
      ) {
        e.preventDefault();
        setSelectedIndex((prev) => {
          if (prev === null) return 0;
          return Math.min(prev + 1, bookmarks.length - 1);
        });
        return;
      }

      if (
        (e.key === "k" || e.key === "ArrowUp") &&
        bookmarks.length > 0
      ) {
        e.preventDefault();
        setSelectedIndex((prev) => {
          if (prev === null) return 0;
          return Math.max(prev - 1, 0);
        });
        return;
      }

      // gg to go to top of list
      if (e.key === "g" && !e.shiftKey && bookmarks.length > 0) {
        const now = Date.now();
        if (now - lastGPressRef.current < 300) {
          e.preventDefault();
          setSelectedIndex(0);
          lastGPressRef.current = 0;
        } else {
          lastGPressRef.current = now;
        }
        return;
      }

      // Shift+G to go to bottom of list
      if (e.key === "G" && e.shiftKey && bookmarks.length > 0) {
        e.preventDefault();
        setSelectedIndex(bookmarks.length - 1);
        return;
      }

      // Enter to open selected bookmark
      if (e.key === "Enter" && selectedIndex !== null && bookmarks[selectedIndex]) {
        e.preventDefault();
        window.open(bookmarks[selectedIndex].url, "_blank");
        return;
      }

      // Edit selected bookmark (e or Shift+R) - only in manage mode
      if (
        (e.key === "e" || (e.key === "R" && e.shiftKey)) &&
        isManaging &&
        selectedIndex !== null &&
        bookmarks[selectedIndex]
      ) {
        e.preventDefault();
        setEditingId(bookmarks[selectedIndex].id);
        return;
      }

      // Delete selected bookmark (d or Shift+D) - only in manage mode
      if (
        (e.key === "d" || (e.key === "D" && e.shiftKey)) &&
        isManaging &&
        selectedIndex !== null &&
        bookmarks[selectedIndex]
      ) {
        e.preventDefault();
        const bookmarkToDelete = bookmarks[selectedIndex];
        deleteOptimisticBookmark(bookmarkToDelete.id);
        deleteBookmark(bookmarkToDelete.id);
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [bookmarks, isManaging, selectedIndex, setIsManaging, setSelectedIndex, setEditingId, deleteOptimisticBookmark]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex !== null && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        block: "center",
        behavior: "smooth",
      });
    }
  }, [selectedIndex]);

  if (bookmarks.length === 0 && searchTerm.trim()) {
    return <SearchResultPrompt searchTerm={searchTerm} />;
  }

  if (bookmarks.length === 0) {
    return <ImportBookmarks />;
  }

  return (
    <ul className="space-y-2 text-sm">
      {bookmarks.map((bookmark, index) => (
        <BookmarkItem
          key={bookmark.id}
          bookmark={bookmark}
          isSelected={index === selectedIndex}
          ref={(el) => {
            itemRefs.current[index] = el;
          }}
        />
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
      <Button
        className="relative gap-2"
        size="sm"
        onClick={() => ref.current?.click()}
        disabled={isPending}
      >
        <svg
          className={cn("h-4 w-4 text-gray-700", isPending && "animate-spin")}
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
      </Button>
      {state && !state.success && state.message && (
        <p className="text-sm text-red-500">{state.message}</p>
      )}
    </div>
  );
}

function BookmarkItem({
  bookmark,
  isSelected,
  ref,
}: {
  bookmark: Bookmark;
  isSelected: boolean;
  ref: React.Ref<HTMLLIElement>;
}) {
  const {
    isManaging,
    editingId,
    setEditingId,
    updateOptimisticBookmark,
    deleteOptimisticBookmark,
  } = useBookmarks();
  const { id, url, title, favicon, timeStamp } = bookmark;

  const isEditing = editingId === id;

  return (
    <li
      ref={ref}
      className={cn(
        "flex h-8 items-center gap-3 -mx-2 px-2 rounded",
        isSelected && "bg-neutral-100"
      )}
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
          <Input
            autoFocus
            className="h-8 w-full px-3 py-1.5 text-sm"
            defaultValue={title || url}
            onBlur={async (e) => {
              const newTitle = e.currentTarget.value;

              if (newTitle === bookmark.title) {
                setEditingId(null);
                return;
              }

              updateOptimisticBookmark(id, newTitle);
              setEditingId(null);
              await updateName(id, newTitle);
            }}
            onKeyDown={async (e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                setEditingId(null);
                return;
              }
              if (e.key === "Enter") {
                e.preventDefault();
                const newTitle = e.currentTarget.value;
                updateOptimisticBookmark(id, newTitle);
                setEditingId(null);
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

      {isManaging && (
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="icon"
            size="xs"
            className="text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Edit bookmark"
            onClick={() => setEditingId(isEditing ? null : id)}
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
          </Button>
          <Button
            size="xs"
            variant="destructive"
            className="text-gray-500"
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
          </Button>
        </div>
      )}
    </li>
  );
}
