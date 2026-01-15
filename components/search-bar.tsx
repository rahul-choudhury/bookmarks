"use client";

import * as React from "react";
import { saveLinkToDB } from "@/lib/actions";
import { useBookmarks } from "@/components/providers/bookmarks-provider";
import { isUrl, transformUrl } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export function SearchBar() {
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const lastEscPressRef = React.useRef(0);

  const { bookmarks, searchTerm, setSearchTerm, addOptimisticBookmark } =
    useBookmarks();

  const [state, action] = React.useActionState(saveLinkToDB, null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      searchInputRef.current?.blur();
      return;
    }

    if (e.key === "Escape") {
      const now = Date.now();
      if (now - lastEscPressRef.current < 300) {
        setSearchTerm("");
      }
      lastEscPressRef.current = now;
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();

      if (!isUrl(searchTerm)) return;
      if (bookmarks.length > 0) return; // early return if duplicate link is found

      setSearchTerm("");

      const transformedUrl = transformUrl(searchTerm);
      addOptimisticBookmark({
        id: crypto.randomUUID(),
        userId: "temp", // TODO: should i leave temp or add the actual id from session?
        url: transformedUrl,
        title: transformedUrl,
        favicon: null,
        timeStamp: new Date(),
      });

      React.startTransition(() => {
        action(searchTerm);
      });
    }
  };

  React.useEffect(() => {
    const handleSearch = (e: KeyboardEvent) => {
      if (e.target === searchInputRef.current) {
        return;
      }

      if (e.key === "/") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleSearch);
    return () => document.removeEventListener("keydown", handleSearch);
  }, []);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          ref={searchInputRef}
          name="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search or paste URL"
          className={`peer h-10 w-full px-4 py-2 text-base ${searchTerm ? "lg:pr-44 lg:focus:pr-4" : ""}`}
        />
        <span className="pointer-events-none absolute top-1/2 right-4 hidden -translate-y-1/2 text-sm text-gray-400 lg:inline lg:peer-focus:hidden">
          Press ? for help
        </span>
      </div>
      {state && !state.success && state.message && (
        <p className="text-sm text-red-500">{state.message}</p>
      )}
    </div>
  );
}
