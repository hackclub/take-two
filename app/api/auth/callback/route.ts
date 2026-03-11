import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { SessionData, sessionOptions } from '@/lib/session'
import { syncUserProjects } from '@/lib/airtable'

export async function GET(request: NextRequest) {
  const base = process.env.NEXT_PUBLIC_BASE_URL!
  const code = request.nextUrl.searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', base))
  }

  // Exchange code for access token
  const tokenRes = await fetch('https://auth.hackclub.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.HCA_CLIENT_ID,
      client_secret: process.env.HCA_CLIENT_SECRET,
      redirect_uri: `${base}/api/auth/callback`,
      code,
      grant_type: 'authorization_code',
    }),
  })

  if (!tokenRes.ok) {
    console.error('Token exchange failed:', await tokenRes.text())
    return NextResponse.redirect(new URL('/?error=token_exchange', base))
  }

  const { access_token } = await tokenRes.json()

  // Get user identity
  const meRes = await fetch('https://auth.hackclub.com/api/v1/me', {
    headers: { Authorization: `Bearer ${access_token}` },
  })

  if (!meRes.ok) {
    console.error('User info failed:', await meRes.text())
    return NextResponse.redirect(new URL('/?error=user_info', base))
  }

  const { identity } = await meRes.json()

  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  session.email = identity.primary_email
  session.name = [identity.first_name, identity.last_name].filter(Boolean).join(' ') || identity.primary_email
  session.accessToken = access_token
  session.slackId = identity.slack_id

  const username = [identity.first_name, identity.last_name]
    .filter(Boolean)
    .join('.')
    .toLowerCase() || identity.primary_email.split('@')[0]

  try {
    const userRecordId = await syncUserProjects(
      identity.slack_id,
      identity.primary_email,
      username
    )
    session.airtableUserId = userRecordId
  } catch (err) {
    console.error('Sync failed:', err)
  }

  await session.save()

  return NextResponse.redirect(new URL('/dashboard', base))
}
