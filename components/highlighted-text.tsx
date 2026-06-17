export function HighlightedText({
  text,
  indices,
}: {
  text: string
  indices: number[]
}) {
  if (indices.length === 0) return text

  const matchSet = new Set(indices)
  const parts: { text: string; highlighted: boolean; start: number }[] = []
  let current = ""
  let currentHighlighted = false
  let currentStart = 0

  for (let i = 0; i < text.length; i++) {
    const isMatch = matchSet.has(i)
    if (i === 0) {
      currentHighlighted = isMatch
      current = text[i]
      currentStart = i
    } else if (isMatch === currentHighlighted) {
      current += text[i]
    } else {
      parts.push({
        text: current,
        highlighted: currentHighlighted,
        start: currentStart,
      })
      current = text[i]
      currentHighlighted = isMatch
      currentStart = i
    }
  }
  parts.push({
    text: current,
    highlighted: currentHighlighted,
    start: currentStart,
  })

  return (
    <>
      {parts.map((part) =>
        part.highlighted ? (
          <mark
            key={`${part.start}-${part.text}`}
            className="bg-accent/10 rounded-sm px-0.5 text-inherit"
          >
            {part.text}
          </mark>
        ) : (
          part.text
        )
      )}
    </>
  )
}
