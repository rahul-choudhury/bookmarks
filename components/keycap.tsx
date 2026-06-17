import { cn } from "@rahul-choudhury/ui"

type KeycapProps = React.ComponentProps<"kbd">

export function Keycap({ className, ...props }: KeycapProps) {
  return (
    <kbd
      className={cn(
        "border-border bg-surface-soft text-text-secondary inline-flex items-center gap-1 rounded-sm border px-2 py-1 font-mono text-xs",
        className
      )}
      {...props}
    />
  )
}
