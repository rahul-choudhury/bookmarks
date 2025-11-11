"use client";

import * as React from "react";
import { Input } from "@base-ui-components/react";

type Bookmark = {
  link: string;
  timeStamp: string;
};

export default function Home() {
  const [bookmarks, setBookmarks] = React.useState<Bookmark[]>([]);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = Object.fromEntries(new FormData(e.currentTarget));
    setBookmarks((prev) => [
      ...prev,
      {
        link: String(form.search),
        timeStamp: new Date().toISOString(),
      },
    ]);
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
    <div className="w-full max-w-4xl mx-auto p-8 space-y-4">
      <form onSubmit={handleSubmit}>
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

      <ul className="space-y-2 text-sm">
        {bookmarks.map(({ link, timeStamp }) => (
          <li key={timeStamp} className="flex justify-between">
            {link}
            <p className="text-gray-500">
              {new Date(timeStamp).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
