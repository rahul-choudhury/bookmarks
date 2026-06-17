/**
 * Scores how well `query` matches `text` and returns the character positions
 * that contributed to the match. Case-insensitive.
 *
 * Returns `{ score: 0, indices: [] }` when there is no match.
 *
 * ## Scoring strategy
 *
 * 1. **Exact substring** — preferred path. Each matched character scores 8
 *    points, with a 10-point bonus when the substring starts at a word
 *    boundary (start of string, after a space, or after `/`).
 *
 * 2. **Fuzzy (sequential character)** — fallback when no exact substring
 *    exists. Characters are matched left-to-right; if any character in the
 *    query cannot be found the match fails.
 *    - +1 per matched character.
 *    - +2 when a match is consecutive with the previous one.
 *    - +3 when a match sits on a word boundary.
 *    - A **tightness bonus** rewards matches whose characters are clustered
 *      close together: `round((queryLen / span) * queryLen * 5)`.
 */
export function fuzzyMatch(
  text: string,
  query: string
): { score: number; indices: number[] } {
  const lower = text.toLowerCase()
  const normalizedQuery = query.toLowerCase()

  // --- Fast path: exact substring match ---
  const substringPos = lower.indexOf(normalizedQuery)
  if (substringPos !== -1) {
    const indices = Array.from(
      { length: normalizedQuery.length },
      (_, i) => substringPos + i
    )
    let score = normalizedQuery.length * 8
    if (
      substringPos === 0 ||
      lower[substringPos - 1] === " " ||
      lower[substringPos - 1] === "/"
    )
      score += 10
    return { score, indices }
  }

  // --- Slow path: fuzzy sequential character matching ---
  let score = 0
  let textIndex = 0
  let prevMatchIndex = -2
  const indices: number[] = []

  for (let i = 0; i < normalizedQuery.length; i++) {
    const char = normalizedQuery[i]
    const found = lower.indexOf(char, textIndex)
    if (found === -1) return { score: 0, indices: [] }

    indices.push(found)
    score += 1
    if (found === prevMatchIndex + 1) score += 2 // consecutive bonus
    if (found === 0 || lower[found - 1] === " " || lower[found - 1] === "/")
      score += 3 // word-boundary bonus

    prevMatchIndex = found
    textIndex = found + 1
  }

  // Tightness bonus — reward matches clustered close together
  const span = indices[indices.length - 1] - indices[0] + 1
  const tightness = normalizedQuery.length / span
  score += Math.round(tightness * normalizedQuery.length * 5)

  return { score, indices }
}
