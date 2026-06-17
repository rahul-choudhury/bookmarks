"use client"

import * as React from "react"
import type { Bookmark } from "@/lib/db/bookmarks"
import { useBookmarkSearch } from "@/lib/hooks/use-bookmark-search"

type BookmarksContextType = {
  bookmarks: Bookmark[]
  matchIndicesMap: Map<string, number[]>
  searchTerm: string
  isManaging: boolean
  selectedIndex: number | null
  editingId: string | null
  setIsManaging: (value: boolean | ((prev: boolean) => boolean)) => void
  setSearchTerm: (value: string) => void
  setSelectedIndex: React.Dispatch<React.SetStateAction<number | null>>
  setEditingId: React.Dispatch<React.SetStateAction<string | null>>
  addOptimisticBookmark: (bookmark: Bookmark) => void
  replaceOptimisticBookmark: (tempId: string, bookmark: Bookmark) => void
  updateOptimisticBookmark: (id: string, title: string) => void
  deleteOptimisticBookmark: (id: string) => void
}

export const BookmarksContext =
  React.createContext<BookmarksContextType | null>(null)

type Action =
  | { type: "ADD"; bookmark: Bookmark }
  | { type: "REPLACE"; tempId: string; bookmark: Bookmark }
  | { type: "UPDATE"; id: string; title: string }
  | { type: "DELETE"; id: string }

function optimisticReducer(state: Bookmark[], action: Action): Bookmark[] {
  switch (action.type) {
    case "ADD":
      return [action.bookmark, ...state]
    case "REPLACE":
      return state.map((item) =>
        item.id === action.tempId ? action.bookmark : item
      )
    case "UPDATE":
      return state.map((item) =>
        item.id === action.id ? { ...item, title: action.title } : item
      )
    case "DELETE":
      return state.filter((item) => item.id !== action.id)
  }
}

export function BookmarksProvider({
  children,
  initialBookmarks,
}: {
  children: React.ReactNode
  initialBookmarks: Bookmark[]
}) {
  const [optimisticBookmarks, dispatchOptimistic] = React.useOptimistic(
    initialBookmarks,
    optimisticReducer
  )

  const addOptimisticBookmark = (bookmark: Bookmark) => {
    React.startTransition(() => {
      dispatchOptimistic({ type: "ADD", bookmark })
    })
  }

  const replaceOptimisticBookmark = (tempId: string, bookmark: Bookmark) => {
    React.startTransition(() => {
      dispatchOptimistic({ type: "REPLACE", tempId, bookmark })
    })
  }

  const updateOptimisticBookmark = (id: string, title: string) => {
    React.startTransition(() => {
      dispatchOptimistic({ type: "UPDATE", id, title })
    })
  }

  const deleteOptimisticBookmark = (id: string) => {
    React.startTransition(() => {
      dispatchOptimistic({ type: "DELETE", id })
    })
  }

  const [isManagingState, setIsManagingState] = React.useState(false)
  const [searchTerm, setSearchTermState] = React.useState("")
  const [rawSelectedIndex, setSelectedIndex] = React.useState<number | null>(
    null
  )
  const [editingId, setEditingId] = React.useState<string | null>(null)

  const setSearchTerm = React.useCallback((value: string) => {
    setSearchTermState(value)
    setSelectedIndex(null)
  }, [])

  const setIsManaging = React.useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      setIsManagingState((prev) => {
        const nextValue = typeof value === "function" ? value(prev) : value
        if (!nextValue) {
          setEditingId(null)
        }
        return nextValue
      })
    },
    []
  )

  const { bookmarks, matchIndicesMap } = useBookmarkSearch(
    optimisticBookmarks,
    searchTerm
  )

  const selectedIndex = React.useMemo(() => {
    if (rawSelectedIndex !== null && rawSelectedIndex >= bookmarks.length) {
      return bookmarks.length > 0 ? bookmarks.length - 1 : null
    }
    return rawSelectedIndex
  }, [rawSelectedIndex, bookmarks.length])

  return (
    <BookmarksContext
      value={{
        bookmarks,
        matchIndicesMap,
        searchTerm,
        isManaging: isManagingState,
        selectedIndex,
        editingId,
        setIsManaging,
        setSearchTerm,
        setSelectedIndex,
        setEditingId,
        addOptimisticBookmark,
        replaceOptimisticBookmark,
        updateOptimisticBookmark,
        deleteOptimisticBookmark,
      }}
    >
      {children}
    </BookmarksContext>
  )
}

export function useBookmarks() {
  const context = React.useContext(BookmarksContext)
  if (!context) {
    throw new Error("useBookmarks must be used within BookmarksProvider")
  }
  return context
}
