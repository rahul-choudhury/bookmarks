import { NotFound } from "@rahul-choudhury/ui/components"
import Link from "next/link"

export default function NotFoundPage() {
  return (
    <div className="bg-bg flex min-h-svh items-center justify-center px-6">
      <NotFound
        action={
          <Link
            href="/"
            className="text-text decoration-border hover:decoration-text inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4"
          >
            Go home
          </Link>
        }
      />
    </div>
  )
}
