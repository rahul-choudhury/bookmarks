"use client";

import { authClient } from "@/lib/auth-client";
import { useBookmarks } from "./providers/bookmarks-provider";
import { redirect, RedirectType } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function TitleBar() {
  const { isManaging, bookmarks, setIsManaging } = useBookmarks();

  const exportBookmarks = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const sanitizedBookmarks = bookmarks.map(({ id, userId, ...rest }) => rest);
    const jsonString = JSON.stringify(sanitizedBookmarks, null, 2);
    const jsonBlob = new Blob([jsonString], { type: "application/json" });

    const url = URL.createObjectURL(jsonBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookmarks-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <header className="flex items-center justify-between pt-6">
      <div className="flex items-center gap-2">
        <svg
          className="h-5 w-5 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
          />
        </svg>
        <h1 className="text-base font-medium text-gray-900">Bookmarks</h1>
      </div>

      <div className="flex gap-2">
        <Button
          className={cn(
            "w-20",
            isManaging && "border-blue-300 bg-blue-50 text-blue-700",
          )}
          size="sm"
          onClick={() => setIsManaging((prev) => !prev)}
          disabled={bookmarks.length === 0 && !isManaging}
        >
          {isManaging ? "Done" : "Manage"}
        </Button>
        <Button
          variant="icon"
          size="icon"
          aria-label="Download"
          onClick={exportBookmarks}
          disabled={bookmarks.length === 0}
        >
          <svg
            className="h-4 w-4 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        </Button>
        <Button
          variant="icon"
          size="icon"
          aria-label="Sign out"
          onClick={() => {
            authClient.signOut();
            redirect("/login", RedirectType.replace);
          }}
        >
          <svg
            className="h-4 w-4 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </Button>
      </div>
    </header>
  );
}
