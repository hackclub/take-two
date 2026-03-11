import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { SessionData, sessionOptions } from '@/lib/session'
import { updateUsername } from '@/lib/airtable'

export async function PUT(request: NextRequest) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)

  if (!session.slackId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  let body
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const { username } = body

  if (typeof username !== 'string' || username.length < 1 || username.length > 30) {
    return NextResponse.json({ error: 'Username must be 1-30 characters' }, { status: 400 })
  }

  // Only allow lowercase alphanumeric, dots, underscores, hyphens
  if (!/^[a-z0-9._-]+$/.test(username)) {
    return NextResponse.json({ error: 'Username can only contain lowercase letters, numbers, dots, underscores, and hyphens' }, { status: 400 })
  }

  try {
    await updateUsername(session.slackId, username)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to update username' }, { status: 500 })
  }
}
