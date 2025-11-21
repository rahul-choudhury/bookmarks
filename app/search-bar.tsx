"use client";

import * as React from "react";
import { Input } from "@base-ui-components/react";
import { saveLinkToDB } from "@/lib/actions";
import { useBookmarks } from "@/components/providers";

export function SearchBar() {
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const { addOptimisticBookmark } = useBookmarks();
  const [, action] = React.useActionState(saveLinkToDB, {
    success: false,
    message: "",
  });

  const handleSubmit = (formData: FormData) => {
    const url = formData.get("search") as string;

    addOptimisticBookmark({
      id: crypto.randomUUID(),
      userId: "temp", // Will be replaced by server action
      url: url.startsWith("http") ? url : `https://${url}`,
      title: url,
      favicon: null,
      timeStamp: new Date(),
    });

    action(formData);
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
    <form action={handleSubmit}>
      <Input
        ref={searchInputRef}
        name="search"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.form?.requestSubmit();
            e.currentTarget.form?.reset();
          }
        }}
        placeholder="Search or paste URL (Press '/' to focus)"
        className="w-full px-4 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </form>
  );
}
