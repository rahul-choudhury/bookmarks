/** Normalize web links without rewriting meaningful paths or query strings. */
export function transformUrl(value: string): string {
  const trimmed = value.trim();
  const url = new URL(
    /^[a-z][a-z\d+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`,
  );
  if (
    !["http:", "https:"].includes(url.protocol) ||
    !url.hostname ||
    url.username ||
    url.password
  ) {
    throw new Error("Enter a valid HTTP or HTTPS link.");
  }
  return url.href;
}
