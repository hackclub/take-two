import { NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { SessionData, sessionOptions } from '@/lib/session'
import { syncUserProjects } from '@/lib/airtable'

export async function POST() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)

  if (!session.email || !session.slackId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const userRecordId = await syncUserProjects(
      session.slackId,
      session.email,
      session.name
    )
    session.airtableUserId = userRecordId
    await session.save()
    return NextResponse.json({ ok: true, userId: userRecordId })
  } catch (err) {
    console.error('Sync failed:', err)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
