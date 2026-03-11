import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { SessionData, sessionOptions } from '@/lib/session'
import { updateGithubUrl } from '@/lib/airtable'

export async function PUT(req: Request) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  if (!session.slackId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const { githubUrl } = body
  if (typeof githubUrl !== 'string') {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const trimmed = githubUrl.trim()
  if (trimmed.length > 200) {
    return NextResponse.json({ error: 'URL too long' }, { status: 400 })
  }
  if (trimmed && !/^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/.test(trimmed)) {
    return NextResponse.json({ error: 'Must be a valid GitHub profile URL' }, { status: 400 })
  }

  await updateGithubUrl(session.slackId, trimmed)
  return NextResponse.json({ ok: true })
}
