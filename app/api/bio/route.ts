import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { SessionData, sessionOptions } from '@/lib/session'
import { updateUserBio } from '@/lib/airtable'

export async function PUT(request: NextRequest) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)

  if (!session.slackId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { bio } = await request.json()

  if (typeof bio !== 'string' || bio.length > 200) {
    return NextResponse.json({ error: 'Bio must be 200 characters or less' }, { status: 400 })
  }

  // Strip control characters (keep newlines/tabs) and trim
  const sanitized = bio.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim()

  try {
    await updateUserBio(session.slackId, sanitized)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to update bio' }, { status: 500 })
  }
}
