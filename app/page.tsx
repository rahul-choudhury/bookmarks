"use client";

import * as React from "react";
import { Input } from "@base-ui-components/react";
import { saveLinkToDB } from "./actions";

export default function Home() {
  const [state, action] = React.useActionState(saveLinkToDB, []);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

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
      <form action={action}>
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
        {state.map(({ url, title, favicon, timeStamp }) => (
          <li key={timeStamp} className="flex items-center gap-3">
            {favicon && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={favicon} alt="" className="size-4 shrink-0" />
            )}
            <a className="flex-1 min-w-0" href={url} target="_blank">
              <p className="truncate">{title || url}</p>
              <p className="text-xs text-gray-500 truncate">{url}</p>
            </a>
            <p className="text-gray-500 shrink-0">
              {new Date(timeStamp).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
