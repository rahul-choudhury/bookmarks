"use client";
import { Button } from "@rahul-choudhury/ui/components";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="library-shell">
      <div className="library-content library-empty">
        <h1 className="mb-4 text-sm">Couldn’t load bookmarks</h1>
        <Button onClick={reset}>Try again</Button>
      </div>
    </main>
  );
}
