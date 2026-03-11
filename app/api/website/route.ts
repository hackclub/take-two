import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { SessionData, sessionOptions } from '@/lib/session'
import { updateWebsiteUrl } from '@/lib/airtable'

export async function PUT(req: Request) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  if (!session.slackId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const { websiteUrl } = body
  if (typeof websiteUrl !== 'string') {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const trimmed = websiteUrl.trim()
  if (trimmed.length > 200) {
    return NextResponse.json({ error: 'URL too long' }, { status: 400 })
  }
  if (trimmed && !/^https?:\/\/[a-zA-Z0-9]/.test(trimmed)) {
    return NextResponse.json({ error: 'Must be a valid URL starting with http(s)://' }, { status: 400 })
  }

  await updateWebsiteUrl(session.slackId, trimmed)
  return NextResponse.json({ ok: true })
}
