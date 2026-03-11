import type { SessionOptions } from 'iron-session'

export interface SessionData {
  email: string
  name: string
  accessToken: string
  slackId: string
  airtableUserId?: string
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'take-two',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
}
