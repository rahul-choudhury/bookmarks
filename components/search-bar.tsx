"use client";

import * as React from "react";
import { Input } from "@base-ui-components/react";
import { saveLinkToDB } from "@/lib/actions";
import { useBookmarks } from "@/components/providers/bookmarks-provider";

export function SearchBar() {
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const lastEscPressRef = React.useRef(0);

  const { bookmarks, searchTerm, setSearchTerm, addOptimisticBookmark } =
    useBookmarks();

  const [state, action] = React.useActionState(saveLinkToDB, {
    success: false,
    message: "",
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

      addOptimisticBookmark({
        id: crypto.randomUUID(),
        userId: "temp", // TODO: should i leave temp or add the actual id from session?
        url: searchTerm.startsWith("http")
          ? searchTerm
          : `https://${searchTerm}`,
        title: searchTerm,
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
      <Input
        ref={searchInputRef}
        name="search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search or paste URL (Press '/' to focus)"
        className="w-full px-4 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 ring-offset-2"
      />
      {!state.success && state.message && (
        <p className="text-red-500 text-sm">{state.message}</p>
      )}
    </div>
  );
}

function isUrl(url: string) {
  const urlRegex = /^(https?:\/\/)|([\w-]+\.)+[\w-]+(\/.*)?$/i;
  if (url.match(urlRegex)) return true;
  return false;
}
