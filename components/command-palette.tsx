"use client";

import { Dialog } from "@base-ui/react/dialog";
import { useCallback, useEffect, useState } from "react";

const shortcuts = [
  {
    category: "Navigation",
    items: [
      { keys: ["j", "↓"], description: "Move down" },
      { keys: ["k", "↑"], description: "Move up" },
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
      { keys: ["Enter"], description: "Add URL (when URL entered)" },
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
];

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    ) {
      return;
    }

    if (e.key === "?") {
      e.preventDefault();
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-all duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 max-h-[80vh] w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-lg border border-gray-200 bg-white p-6 shadow-xl transition-all duration-150 data-ending-style:scale-90 data-ending-style:opacity-0 data-starting-style:scale-90 data-starting-style:opacity-0">
          <Dialog.Title className="mb-4 text-lg font-semibold">
            Keyboard Shortcuts
          </Dialog.Title>
          <div className="space-y-6">
            {shortcuts.map((section) => (
              <div key={section.category}>
                <h3 className="mb-2 text-xs font-medium tracking-wider text-gray-500 uppercase">
                  {section.category}
                </h3>
                <div className="space-y-2">
                  {section.items.map((item) => (
                    <div
                      key={item.description}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-700">
                        {item.description}
                      </span>
                      <div className="flex gap-1">
                        {item.keys.map((key, i) => (
                          <span key={i}>
                            <kbd className="rounded border border-gray-300 bg-gray-100 px-2 py-1 font-mono text-xs">
                              {key}
                            </kbd>
                            {i < item.keys.length - 1 && (
                              <span className="mx-1 text-gray-400">/</span>
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
          <Dialog.Close className="absolute top-4 right-4 p-1 text-gray-400 transition-colors hover:text-gray-600">
            <svg
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
          </Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
