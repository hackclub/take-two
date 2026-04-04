import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_HOSTS = new Set([
  'dl.airtable.com',
  'v5.airtableusercontent.com',
  'avatars.slack-edge.com',
  'secure.gravatar.com',
])

function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:') return false
    return ALLOWED_HOSTS.has(parsed.hostname)
  } catch {
    return false
  }
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url || !isAllowedUrl(url)) {
    return new NextResponse('Bad request', { status: 400 })
  }

  const upstream = await fetch(url)

  if (!upstream.ok) {
    // Return a 1x1 transparent PNG placeholder instead of a broken image
    const pixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQABNjN9GQAAAAlwSFlzAAAWJQAAFiUBSVIk8AAAAA0lEQVQI12P4z8BQDwAEgAF/QualzQAAAABJRU5ErkJggg==',
      'base64'
    )
    return new NextResponse(pixel, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache',
      },
    })
  }

  const contentType = upstream.headers.get('content-type') || 'image/jpeg'
  const body = await upstream.arrayBuffer()

  return new NextResponse(body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=60',
    },
  })
}
