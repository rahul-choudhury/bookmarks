"use client";

import { useBookmarks } from "./providers";

export function TitleBar() {
  const { isManaging, setIsManaging } = useBookmarks();
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <svg
          className="w-5 h-5 text-gray-700"
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

      <button
        className={`w-20 px-3 py-1 text-sm border hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 ring-offset-2 transition-colors ${
          isManaging
            ? "bg-blue-50 border-blue-300 text-blue-700"
            : "border-gray-300"
        }`}
        onClick={() => setIsManaging((prev) => !prev)}
      >
        {isManaging ? "Done" : "Manage"}
      </button>
    </header>
  );
}
