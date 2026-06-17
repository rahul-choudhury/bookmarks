import { Skeleton } from "@rahul-choudhury/ui/components"

const rowWidths = [280, 340, 250, 310, 290, 360, 270, 320]

export default function Loading() {
  return (
    <div className="grid grid-cols-[1fr_minmax(auto,800px)_1fr] gap-x-6 gap-y-4 pb-6 *:col-start-2 *:min-w-0">
      <div className="z-(--z-sticky) bg-bg/95 sticky top-0 space-y-4 pb-2 backdrop-blur-sm">
        <header className="flex items-center justify-between pt-6">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-sm" />
            <Skeleton className="h-5 w-24 rounded-sm" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="size-8" />
            <Skeleton className="size-8" />
          </div>
        </header>

        <div className="space-y-2">
          <Skeleton className="border-border h-10 w-full border" />
        </div>
      </div>

      <ul className="space-y-2 text-sm">
        {rowWidths.map((width) => (
          <li key={width} className="flex h-8 items-center gap-3">
            <Skeleton className="size-4 shrink-0 rounded-sm" />
            <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
              <Skeleton
                className="h-4 rounded-sm"
                style={{ width: `${width}px` }}
              />
              <Skeleton className="hidden h-4 w-32 rounded-sm md:block" />
            </div>
            <Skeleton className="hidden h-4 w-20 shrink-0 rounded-sm md:block" />
          </li>
        ))}
      </ul>
    </div>
  )
}
