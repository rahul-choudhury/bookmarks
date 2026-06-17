"use client"

import { cn } from "@rahul-choudhury/ui"
import { Input } from "@rahul-choudhury/ui/components"
import * as React from "react"
import { useBookmarks } from "@/components/providers/bookmarks-provider"
import { saveLinkToDB } from "@/lib/actions"
import { isUrl, transformUrl } from "@/lib/utils"

export function SearchBar() {
  const searchInputRef = React.useRef<HTMLInputElement>(null)
  const lastEscPressRef = React.useRef(0)

  const {
    bookmarks,
    searchTerm,
    setSearchTerm,
    selectedIndex,
    setSelectedIndex,
    addOptimisticBookmark,
    replaceOptimisticBookmark,
  } = useBookmarks()

  const [state, action] = React.useActionState(saveLinkToDB, null)
  const lastReplacedRef = React.useRef<string | null>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") {
      e.preventDefault()
      searchInputRef.current?.blur()
      return
    }

    if (e.key === "Escape") {
      const now = Date.now()
      if (now - lastEscPressRef.current < 300) {
        setSearchTerm("")
      }
      lastEscPressRef.current = now
      return
    }

    const isDown = e.key === "ArrowDown" || (e.ctrlKey && e.key === "n")
    const isUp = e.key === "ArrowUp" || (e.ctrlKey && e.key === "p")

    if ((isDown || isUp) && bookmarks.length > 0) {
      e.preventDefault()
      setSelectedIndex((prev) => {
        if (prev === null) return isDown ? 0 : bookmarks.length - 1
        if (isDown) return Math.min(prev + 1, bookmarks.length - 1)
        return Math.max(prev - 1, 0)
      })
      return
    }

    if (e.key === "Enter") {
      e.preventDefault()

      if (selectedIndex !== null && bookmarks[selectedIndex]) {
        window.open(bookmarks[selectedIndex].url, "_blank")
        return
      }

      if (!isUrl(searchTerm)) return
      if (bookmarks.length > 0) return

      setSearchTerm("")

      const transformedUrl = transformUrl(searchTerm)
      const tempId = crypto.randomUUID()
      addOptimisticBookmark({
        id: tempId,
        userId: "temp", // TODO: should i leave temp or add the actual id from session?
        url: transformedUrl,
        title: transformedUrl,
        favicon: null,
        timeStamp: new Date(),
      })

      React.startTransition(() => {
        action({ url: searchTerm, clientId: tempId })
      })
    }
  }

  React.useEffect(() => {
    const handleSearch = (e: KeyboardEvent) => {
      if (e.target === searchInputRef.current) {
        return
      }

      if (e.key === "/") {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }

    document.addEventListener("keydown", handleSearch)
    return () => document.removeEventListener("keydown", handleSearch)
  }, [])

  React.useEffect(() => {
    if (!state?.success || !state.bookmark || !state.clientId) return
    if (lastReplacedRef.current === state.clientId) return
    replaceOptimisticBookmark(state.clientId, state.bookmark)
    lastReplacedRef.current = state.clientId
  }, [state, replaceOptimisticBookmark])

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          ref={searchInputRef}
          size="lg"
          name="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search or paste URL"
          className={cn(
            "peer text-base",
            searchTerm && "lg:pr-44 lg:focus:pr-4"
          )}
        />
        <span className="text-text-muted pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 text-sm lg:inline lg:peer-focus:hidden">
          Press ? for help
        </span>
      </div>
      {state && !state.success && state.message && (
        <p className="text-danger text-sm">{state.message}</p>
      )}
    </div>
  )
}
