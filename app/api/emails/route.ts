import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { SessionData, sessionOptions } from '@/lib/session'
import { updateEmails } from '@/lib/airtable'

const MAX_EMAILS = 10
const MAX_LENGTH = 2000

export async function PUT(req: Request) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  if (!session.slackId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const { emails } = body
  if (typeof emails !== 'string') {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  if (emails.length > MAX_LENGTH) {
    return NextResponse.json({ error: 'Too long' }, { status: 400 })
  }

  // Validate each line is a valid-looking email
  const lines = emails.split('\n').map((l: string) => l.trim()).filter(Boolean)
  if (lines.length > MAX_EMAILS) {
    return NextResponse.json({ error: `Maximum ${MAX_EMAILS} emails` }, { status: 400 })
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  for (const line of lines) {
    if (!emailRegex.test(line)) {
      return NextResponse.json({ error: `Invalid email: ${line}` }, { status: 400 })
    }
  }

  const sanitized = lines.join('\n')
  await updateEmails(session.slackId, sanitized)
  return NextResponse.json({ ok: true })
}
