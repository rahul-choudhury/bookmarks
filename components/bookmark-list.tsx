"use client"

import { cn } from "@rahul-choudhury/ui"
import { Button, EmptyState, Input } from "@rahul-choudhury/ui/components"
import { usePrefersReducedMotion } from "@rahul-choudhury/ui/hooks"
import { useActionState, useEffect, useRef } from "react"
import { HighlightedText } from "@/components/highlighted-text"
import { Keycap } from "@/components/keycap"
import { useBookmarks } from "@/components/providers/bookmarks-provider"
import { deleteBookmark, importBookmarks, updateName } from "@/lib/actions"
import type { Bookmark } from "@/lib/db/bookmarks"
import { isUrl } from "@/lib/utils"

const bookmarkDateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

export function BookmarkList() {
  const {
    bookmarks,
    matchIndicesMap,
    searchTerm,
    isManaging,
    selectedIndex,
    setIsManaging,
    setSelectedIndex,
    setEditingId,
    deleteOptimisticBookmark,
  } = useBookmarks()

  const itemRefs = useRef<(HTMLLIElement | null)[]>([])
  const lastGPressRef = useRef<number>(0)
  const prefersReducedMotion = usePrefersReducedMotion()

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInputFocused =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA"

      if (isInputFocused) return

      // 'm' to toggle management mode
      if (e.key === "m" && bookmarks.length > 0) {
        e.preventDefault()
        setIsManaging((prev) => !prev)
        return
      }

      // Escape to exit management mode or clear selection
      if (e.key === "Escape") {
        if (isManaging) {
          setIsManaging(false)
        } else if (selectedIndex !== null) {
          setSelectedIndex(null)
        }
        return
      }

      // Navigation: j/k, arrow keys, or Ctrl+N/P
      if (
        (e.key === "j" ||
          e.key === "ArrowDown" ||
          (e.ctrlKey && e.key === "n")) &&
        bookmarks.length > 0
      ) {
        e.preventDefault()
        setSelectedIndex((prev) => {
          if (prev === null) return 0
          return Math.min(prev + 1, bookmarks.length - 1)
        })
        return
      }

      if (
        (e.key === "k" ||
          e.key === "ArrowUp" ||
          (e.ctrlKey && e.key === "p")) &&
        bookmarks.length > 0
      ) {
        e.preventDefault()
        setSelectedIndex((prev) => {
          if (prev === null) return 0
          return Math.max(prev - 1, 0)
        })
        return
      }

      // gg to go to top of list
      if (e.key === "g" && !e.shiftKey && bookmarks.length > 0) {
        const now = Date.now()
        if (now - lastGPressRef.current < 300) {
          e.preventDefault()
          setSelectedIndex(0)
          lastGPressRef.current = 0
        } else {
          lastGPressRef.current = now
        }
        return
      }

      // Shift+G to go to bottom of list
      if (e.key === "G" && e.shiftKey && bookmarks.length > 0) {
        e.preventDefault()
        setSelectedIndex(bookmarks.length - 1)
        return
      }

      // Enter to open selected bookmark
      if (
        e.key === "Enter" &&
        selectedIndex !== null &&
        bookmarks[selectedIndex]
      ) {
        e.preventDefault()
        window.open(bookmarks[selectedIndex].url, "_blank")
        return
      }

      // Edit selected bookmark (e or Shift+R) - only in manage mode
      if (
        (e.key === "e" || (e.key === "R" && e.shiftKey)) &&
        isManaging &&
        selectedIndex !== null &&
        bookmarks[selectedIndex]
      ) {
        e.preventDefault()
        const target = bookmarks[selectedIndex]
        if (target.userId !== "temp") {
          setEditingId(target.id)
        }
        return
      }

      // Delete selected bookmark (d or Shift+D) - only in manage mode
      if (
        (e.key === "d" || (e.key === "D" && e.shiftKey)) &&
        isManaging &&
        selectedIndex !== null &&
        bookmarks[selectedIndex]
      ) {
        e.preventDefault()
        const bookmarkToDelete = bookmarks[selectedIndex]
        if (bookmarkToDelete.userId !== "temp") {
          deleteOptimisticBookmark(bookmarkToDelete.id)
          deleteBookmark(bookmarkToDelete.id)
        }
        return
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [
    bookmarks,
    isManaging,
    selectedIndex,
    setIsManaging,
    setSelectedIndex,
    setEditingId,
    deleteOptimisticBookmark,
  ])

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex !== null && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        block: "center",
        behavior: prefersReducedMotion ? "auto" : "smooth",
      })
    }
  }, [selectedIndex, prefersReducedMotion])

  if (bookmarks.length === 0 && searchTerm.trim()) {
    return <SearchResultPrompt searchTerm={searchTerm} />
  }

  if (bookmarks.length === 0) {
    return <ImportBookmarks />
  }

  return (
    <ul className="space-y-2 text-sm">
      {bookmarks.map((bookmark, index) => (
        <BookmarkItem
          key={bookmark.id}
          bookmark={bookmark}
          matchIndices={matchIndicesMap.get(bookmark.id)}
          isSelected={index === selectedIndex}
          ref={(el) => {
            itemRefs.current[index] = el
          }}
        />
      ))}
    </ul>
  )
}

function SearchResultPrompt({ searchTerm }: { searchTerm: string }) {
  return (
    <EmptyState
      title={`No results found for "${searchTerm}"`}
      description={
        !isUrl(searchTerm)
          ? "Try a different title, domain, or URL."
          : undefined
      }
      action={
        isUrl(searchTerm) ? (
          <p className="text-text-secondary text-sm">
            Press{" "}
            <Keycap>
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 4v7a4 4 0 0 1-4 4H4" />
                <path d="m9 10-5 5 5 5" />
              </svg>
              Enter
            </Keycap>{" "}
            to add this link to your bookmarks
          </p>
        ) : undefined
      }
      className="py-8"
    />
  )
}

function ImportBookmarks() {
  const [state, action, isPending] = useActionState(importBookmarks, null)
  const ref = useRef<HTMLInputElement>(null)

  return (
    <div className="py-12">
      <EmptyState
        title="No bookmarks yet"
        description="Import a previous export to get your library back in place."
        action={
          <>
            <Button
              variant="secondary"
              size="sm"
              className="relative gap-2"
              onClick={() => ref.current?.click()}
              disabled={isPending}
            >
              <svg
                aria-hidden="true"
                className={cn("h-4 w-4", isPending && "animate-spin")}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>{isPending ? "Importing..." : "Import Bookmarks"}</span>
            </Button>
            <form action={action}>
              <input
                ref={ref}
                name="json"
                type="file"
                accept="application/JSON"
                onChange={(e) => e.currentTarget.form?.requestSubmit()}
                disabled={isPending}
                hidden
              />
            </form>
          </>
        }
      />
      {state && !state.success && state.message && (
        <p className="text-danger mt-4 text-center text-sm">{state.message}</p>
      )}
    </div>
  )
}

function BookmarkItem({
  bookmark,
  matchIndices,
  isSelected,
  ref,
}: {
  bookmark: Bookmark
  matchIndices?: number[]
  isSelected: boolean
  ref: React.Ref<HTMLLIElement>
}) {
  const {
    isManaging,
    editingId,
    setEditingId,
    updateOptimisticBookmark,
    deleteOptimisticBookmark,
  } = useBookmarks()
  const { id, url, title, favicon, timeStamp } = bookmark
  const isOptimistic = bookmark.userId === "temp"

  const isEditing = !isOptimistic && editingId === id

  return (
    <li
      ref={ref}
      className={cn(
        "-mx-2 flex h-8 items-center gap-3 rounded-md px-2 transition-colors duration-150",
        isSelected && "bg-surface-soft",
        isOptimistic && "opacity-60"
      )}
    >
      <div className="size-4 shrink-0">
        {favicon ? (
          // eslint-disable-next-line @next/next/no-img-element -- favicon URLs are dynamic and don't fit next/image optimization.
          <img
            src={favicon}
            alt=""
            className="size-4"
            onError={(e) => {
              e.currentTarget.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpath d='M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20'/%3E%3Cpath d='M2 12h20'/%3E%3C/svg%3E"
            }}
          />
        ) : (
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-text-muted size-4"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
            <path d="M2 12h20" />
          </svg>
        )}
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
        {isEditing ? (
          <Input
            autoFocus
            size="sm"
            className="w-full"
            defaultValue={title || url}
            onBlur={async (e) => {
              const newTitle = e.currentTarget.value

              if (newTitle === bookmark.title) {
                setEditingId(null)
                return
              }

              updateOptimisticBookmark(id, newTitle)
              setEditingId(null)
              await updateName(id, newTitle)
            }}
            onKeyDown={async (e) => {
              if (e.key === "Escape") {
                e.preventDefault()
                e.stopPropagation()
                setEditingId(null)
                return
              }
              if (e.key === "Enter") {
                e.preventDefault()
                const newTitle = e.currentTarget.value
                updateOptimisticBookmark(id, newTitle)
                setEditingId(null)
                await updateName(id, newTitle)
              }
            }}
          />
        ) : (
          <a
            href={url}
            target="_blank"
            rel="noopener"
            className="max-w-137.5 text-text hover:text-text-secondary truncate transition-colors"
          >
            {matchIndices && title ? (
              <HighlightedText text={title} indices={matchIndices} />
            ) : (
              title || url
            )}
          </a>
        )}
        <p className="text-text-muted hidden text-xs md:block">
          [{new URL(url).hostname}]
        </p>
      </div>
      <p className="text-text-muted hidden shrink-0 font-mono md:block">
        {bookmarkDateFormatter.format(new Date(timeStamp))}
      </p>

      {isManaging && !isOptimistic && (
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-text-muted hover:text-text size-7"
            aria-label="Edit bookmark"
            onClick={() => setEditingId(isEditing ? null : id)}
          >
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
              <path d="m15 5 4 4" />
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-text-muted hover:text-danger size-7"
            aria-label="Delete bookmark"
            onClick={async () => {
              deleteOptimisticBookmark(id)
              await deleteBookmark(id)
            }}
          >
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              <path d="M3 6h18" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </Button>
        </div>
      )}
    </li>
  )
}
