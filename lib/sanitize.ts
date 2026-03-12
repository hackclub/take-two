/** Return the URL only if it uses http: or https: protocol, otherwise undefined. */
export function safeHref(url: string | undefined): string | undefined {
  if (!url) return undefined
  try {
    const parsed = new URL(url)
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return url
  } catch {
    // invalid URL
  }
  return undefined
}
