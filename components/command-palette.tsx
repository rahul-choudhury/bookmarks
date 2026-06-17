"use client"

import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@rahul-choudhury/ui/components"
import { useCallback, useEffect, useState } from "react"
import { Keycap } from "@/components/keycap"

const shortcuts = [
  {
    category: "Navigation",
    items: [
      { keys: ["j", "↓", "⌃N"], description: "Move down" },
      { keys: ["k", "↑", "⌃P"], description: "Move up" },
      { keys: ["g g"], description: "Jump to top" },
      { keys: ["G"], description: "Jump to bottom" },
      { keys: ["Enter"], description: "Open selected bookmark" },
    ],
  },
  {
    category: "Search",
    items: [
      { keys: ["/"], description: "Focus search" },
      { keys: ["Esc ×2"], description: "Clear search" },
      { keys: ["Enter"], description: "Open selected / Add URL" },
      { keys: ["Tab"], description: "Lose focus from search" },
    ],
  },
  {
    category: "Management",
    items: [
      { keys: ["m"], description: "Toggle manage mode" },
      { keys: ["e", "R"], description: "Edit selected" },
      { keys: ["d", "D"], description: "Delete selected" },
      { keys: ["Esc"], description: "Exit manage mode" },
    ],
  },
  {
    category: "Help",
    items: [{ keys: ["?"], description: "Show this dialog" }],
  },
]

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    ) {
      return
    }

    if (e.key === "?") {
      e.preventDefault()
      setIsOpen(true)
    }
  }, [])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="border-border max-h-[80vh] max-w-lg overflow-auto border p-6">
        <DialogTitle className="mb-4 pr-10 text-lg font-semibold">
          Keyboard Shortcuts
        </DialogTitle>
        <div className="space-y-6">
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h3 className="text-text-muted mb-2 text-xs font-medium uppercase tracking-[0.12em]">
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <div
                    key={item.description}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="text-text-secondary text-sm">
                      {item.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((key, index) => (
                        <span
                          key={`${item.description}-${key}`}
                          className="inline-flex items-center"
                        >
                          <Keycap>{key}</Keycap>
                          {index < item.keys.length - 1 && (
                            <span className="text-text-muted mx-1">/</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <DialogClose
          render={
            <Button
              variant="ghost"
              size="icon"
              className="text-text-muted hover:text-text absolute right-4 top-4 size-8"
              aria-label="Close shortcuts"
            />
          }
        >
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}
