import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { SessionData, sessionOptions } from '@/lib/session'
import { syncUserProjects } from '@/lib/airtable'

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const { slackId } = await request.json()
  if (!slackId?.trim()) {
    return NextResponse.json({ error: 'Slack ID is required' }, { status: 400 })
  }

  const res = await fetch(`https://slack.com/api/users.info?user=${slackId.trim()}`, {
    headers: { Authorization: `Bearer ${process.env.SLACK_BOT_SECRET}` },
  })

  const data = await res.json()

  if (!data.ok) {
    return NextResponse.json({ error: data.error ?? 'Slack API error' }, { status: 400 })
  }

  const email = data.user?.profile?.email
  const displayName = data.user?.profile?.display_name || data.user?.profile?.real_name || data.user?.name || slackId
  const name = data.user?.profile?.real_name || data.user?.name || slackId

  if (!email) {
    return NextResponse.json(
      { error: 'No email on this Slack profile (missing users:read.email scope?)' },
      { status: 400 }
    )
  }

  const trimmedSlackId = slackId.trim()
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  session.email = email
  session.name = name
  session.accessToken = 'impersonated'
  session.slackId = trimmedSlackId

  try {
    const username = displayName.replace(/\s+/g, '.').toLowerCase().replace(/[^a-z0-9._-]/g, '')
    const userRecordId = await syncUserProjects(trimmedSlackId, email, username)
    session.airtableUserId = userRecordId
  } catch (err) {
    console.error('Sync failed during impersonate:', err)
  }

  await session.save()

  return NextResponse.json({ ok: true, email, name })
}
