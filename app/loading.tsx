export default function Loading() {
  return (
    <div className="grid grid-cols-[1fr_minmax(auto,800px)_1fr] gap-x-6 gap-y-4 pb-6 *:col-start-2 *:min-w-0">
      <div className="sticky top-0 space-y-4 bg-white/95">
        {/* TitleBar Skeleton */}
        <header className="flex items-center justify-between pt-6">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 animate-pulse bg-gray-200" />
            <div className="h-5 w-24 animate-pulse bg-gray-200" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-20 animate-pulse bg-gray-200" />
            <div className="h-8 w-8 animate-pulse bg-gray-200" />
            <div className="h-8 w-8 animate-pulse bg-gray-200" />
          </div>
        </header>

        {/* SearchBar Skeleton */}
        <div className="space-y-2">
          <div className="h-10 w-full animate-pulse border border-gray-200 bg-gray-100" />
        </div>
      </div>

      {/* BookmarkList Skeleton */}
      <ul className="space-y-2 text-sm">
        {[280, 340, 250, 310, 290, 360, 270, 320].map((width, i) => (
          <li key={i} className="flex h-8 items-center gap-3">
            <div className="size-4 shrink-0 animate-pulse bg-gray-200" />
            <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
              <div
                className="h-4 animate-pulse bg-gray-200"
                style={{ width: `${width}px` }}
              />
              <div className="hidden h-4 w-32 animate-pulse bg-gray-200 md:block" />
            </div>
            <div className="hidden h-4 w-20 shrink-0 animate-pulse bg-gray-200 md:block" />
          </li>
        ))}
      </ul>
    </div>
  );
}
