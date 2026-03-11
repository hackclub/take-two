import { NextResponse } from 'next/server'

export function GET() {
  const params = new URLSearchParams({
    client_id: process.env.HCA_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`,
    response_type: 'code',
    scope: 'email name slack_id',
  })
  return NextResponse.redirect(
    `https://auth.hackclub.com/oauth/authorize?${params}`
  )
}
