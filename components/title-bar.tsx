"use client"

import { cn } from "@rahul-choudhury/ui"
import { Button } from "@rahul-choudhury/ui/components"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { useBookmarks } from "./providers/bookmarks-provider"

export function TitleBar() {
  const router = useRouter()
  const { isManaging, bookmarks, setIsManaging } = useBookmarks()

  const exportBookmarks = () => {
    const sanitizedBookmarks = bookmarks.map(
      ({ id: _id, userId: _userId, ...rest }) => rest
    )
    const jsonString = JSON.stringify(sanitizedBookmarks, null, 2)
    const jsonBlob = new Blob([jsonString], { type: "application/json" })

    const url = URL.createObjectURL(jsonBlob)
    const a = document.createElement("a")
    a.href = url
    a.download = `bookmarks-${new Date().toISOString()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <header className="flex items-center justify-between pt-6">
      <div className="flex items-center gap-2">
        <svg
          aria-hidden="true"
          className="text-text-secondary h-5 w-5"
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
        <h1 className="text-text text-base font-medium">Bookmarks</h1>
      </div>

      <div className="flex gap-2">
        <Button
          variant="secondary"
          className={cn(
            "w-20",
            isManaging && "border-accent/20 bg-accent/10 text-text"
          )}
          size="sm"
          aria-pressed={isManaging}
          onClick={() => setIsManaging((prev) => !prev)}
          disabled={bookmarks.length === 0 && !isManaging}
        >
          {isManaging ? "Done" : "Manage"}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-text-secondary hover:text-text size-8"
          aria-label="Download"
          onClick={exportBookmarks}
          disabled={bookmarks.length === 0}
        >
          <svg
            aria-hidden="true"
            className="h-4 w-4"
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
          variant="ghost"
          size="icon"
          className="text-text-secondary hover:text-text size-8"
          aria-label="Sign out"
          onClick={async () => {
            await authClient.signOut()
            router.replace("/login")
          }}
        >
          <svg
            aria-hidden="true"
            className="h-4 w-4"
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
  )
}
