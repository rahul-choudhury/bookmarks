import * as React from "react"
import type { Bookmark } from "@/lib/db/bookmarks"
import { fuzzyMatch } from "@/lib/fuzzy-match"

/**
 * Fuzzy-filters and ranks a list of bookmarks against a search term.
 *
 * Each bookmark is scored by matching the query against its title only
 * via {@link fuzzyMatch}. Non-matching bookmarks are excluded from the result.
 *
 * When `searchTerm` is empty or whitespace-only, the original list is returned
 * unfiltered with an empty match-indices map.
 *
 * @param bookmarks  - The full, unfiltered bookmark list.
 * @param searchTerm - The current user query (may be empty).
 * @returns `bookmarks` sorted by relevance and a `matchIndicesMap` keyed by
 *   bookmark id containing the character positions that matched in each
 *   bookmark's title (used for highlight rendering).
 */
export function useBookmarkSearch(
  bookmarks: Bookmark[],
  searchTerm: string
): { bookmarks: Bookmark[]; matchIndicesMap: Map<string, number[]> } {
  return React.useMemo(() => {
    const emptyMap = new Map<string, number[]>()

    if (!searchTerm.trim()) {
      return { bookmarks, matchIndicesMap: emptyMap }
    }

    const query = searchTerm.trim().toLowerCase()

    const scored = bookmarks
      .map((bookmark) => {
        const titleMatch = fuzzyMatch(bookmark.title ?? "", query)
        return {
          bookmark,
          score: titleMatch.score,
          indices: titleMatch.indices,
        }
      })
      .filter(({ score }) => score > 0)

    scored.sort((a, b) => b.score - a.score)

    const map = new Map<string, number[]>()
    for (const { bookmark, indices } of scored) {
      map.set(bookmark.id, indices)
    }

    return {
      bookmarks: scored.map(({ bookmark }) => bookmark),
      matchIndicesMap: map,
    }
  }, [searchTerm, bookmarks])
}
