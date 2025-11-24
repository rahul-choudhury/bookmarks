"use client";

import * as React from "react";
import { Input } from "@base-ui-components/react";
import { saveLinkToDB } from "@/lib/actions";
import { useBookmarks } from "@/components/providers/bookmarks-provider";

export function SearchBar() {
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const { searchTerm, setSearchTerm, addOptimisticBookmark } = useBookmarks();

  // TODO: do something about the state
  const [, action] = React.useActionState(saveLinkToDB, {
    success: false,
    message: "",
  });

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
    <Input
      ref={searchInputRef}
      name="search"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();

          if (!isUrl(searchTerm)) return;
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
      }}
      placeholder="Search or paste URL (Press '/' to focus)"
      className="w-full px-4 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 ring-offset-2"
    />
  );
}

function isUrl(url: string) {
  const urlRegex = /^(https?:\/\/)|([\w-]+\.)+[\w-]+(\/.*)?$/i;
  if (url.match(urlRegex)) return true;
  return false;
}
