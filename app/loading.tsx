import { Skeleton } from "@rahul-choudhury/ui/components";
export default function Loading() {
  return (
    <main
      className="library-shell"
      aria-label="Loading bookmarks"
      aria-busy="true"
    >
      <div className="library-header">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="library-content">
        <div className="library-toolbar">
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-9 w-16" />
            ))}
          </div>
          <div className="search-wrap">
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
        <div className="bookmark-list pt-4">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="flex items-center gap-4 py-3.5">
              <Skeleton className="w-40 max-sm:w-[104px] aspect-[1200/630] shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
