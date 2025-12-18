export default function Loading() {
  return (
    <div className="relative mx-auto w-full max-w-4xl space-y-4 p-6 md:p-8">
      <TitleBarPlaceholder />
      <SearchBarPlaceholder />
      <BookmarkListPlaceholder />
    </div>
  );
}

function TitleBarPlaceholder() {
  return (
    <header className="flex items-center justify-between">
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
        <button
          className="h-8 w-20 border border-gray-300 px-3 py-1 text-sm ring-offset-2 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
          disabled
        >
          Manage
        </button>
        <button
          className="flex h-8 w-8 items-center justify-center border border-gray-300 ring-offset-2 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
          aria-label="Download"
          disabled
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
        </button>
        <button
          className="flex h-8 w-8 items-center justify-center border border-gray-300 ring-offset-2 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
          aria-label="Sign out"
          disabled
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
        </button>
      </div>
    </header>
  );
}

function SearchBarPlaceholder() {
  return (
    <div className="sticky top-6 space-y-2 md:top-8">
      <input
        name="search"
        placeholder="Search or paste URL (Press '/' to focus)"
        className="h-10 w-full border border-gray-300 bg-white px-4 py-2 text-base ring-offset-2 focus:ring-2 focus:ring-gray-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        disabled
      />
    </div>
  );
}

function BookmarkListPlaceholder() {
  return (
    <ul className="space-y-2 text-sm">
      {Array.from({ length: 10 }).map((_, i) => (
        <li
          key={i}
          className="flex h-8 animate-pulse items-center gap-3 opacity-50"
        >
          <div className="size-4 shrink-0 bg-gray-200" />
          <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
            <div className="h-4 flex-1 bg-gray-200" />
            <div className="hidden h-4 w-24 bg-gray-200 md:block" />
          </div>
          <div className="hidden h-4 w-20 shrink-0 bg-gray-200 md:block" />
        </li>
      ))}
    </ul>
  );
}
