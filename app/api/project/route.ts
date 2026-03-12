import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { SessionData, sessionOptions } from '@/lib/session'
import { updateProjectField } from '@/lib/airtable'

const ALLOWED_FIELDS = ['project name', 'description', 'demo_url'] as const
type AllowedField = (typeof ALLOWED_FIELDS)[number]

const MAX_LENGTHS: Record<AllowedField, number> = {
  'project name': 200,
  description: 1000,
  demo_url: 500,
}

const URL_FIELDS = new Set<string>(['demo_url'])

export async function PUT(request: NextRequest) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)

  if (!session.slackId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  let body
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { projectId, field, value } = body

  if (typeof projectId !== 'string' || !projectId) {
    return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })
  }

  if (!ALLOWED_FIELDS.includes(field)) {
    return NextResponse.json({ error: 'Invalid field' }, { status: 400 })
  }

  const maxLen = MAX_LENGTHS[field as AllowedField]
  if (typeof value !== 'string' || value.length > maxLen) {
    return NextResponse.json({ error: `Value must be ${maxLen} characters or less` }, { status: 400 })
  }

  const sanitized = value
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/<[^>]*>/g, '')
    .trim()

  // URL fields must be valid http(s) URLs
  if (URL_FIELDS.has(field) && sanitized) {
    try {
      const url = new URL(sanitized)
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return NextResponse.json({ error: 'Must be an HTTP or HTTPS URL' }, { status: 400 })
      }
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }
  }

  try {
    await updateProjectField(session.slackId, projectId, field, sanitized)
    return NextResponse.json({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to update project'
    const status = msg === 'Project not found' ? 403 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}
