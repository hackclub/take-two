import { NextRequest, NextResponse } from 'next/server'
import { getAllUsers, getSlackProfile, compareUsers } from '@/lib/airtable'

const PER_PAGE = 10

export async function GET(req: NextRequest) {
  const page = Math.max(1, Number(req.nextUrl.searchParams.get('page')) || 1)

  const users = await getAllUsers()
  const sorted = [...users].sort(compareUsers)

  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE))
  const clampedPage = Math.min(page, totalPages)
  const start = (clampedPage - 1) * PER_PAGE
  const pageUsers = sorted.slice(start, start + PER_PAGE)

  const profiles = await Promise.all(
    pageUsers.map(async (user) => {
      const slack = await getSlackProfile(user.slackId)
      return {
        username: user.username,
        statusCounts: user.statusCounts,
        ranks: user.ranks,
        avatarUrl: slack?.avatarUrl,
        displayName: slack?.displayName,
      }
    }),
  )

  return NextResponse.json({
    users: profiles,
    page: clampedPage,
    totalPages,
    total: sorted.length,
  })
}
