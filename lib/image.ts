/** Proxy an image URL through /api/image to handle stale Airtable attachment links. */
export function proxyImageUrl(url: string): string {
  return `/api/image?url=${encodeURIComponent(url)}`
}
