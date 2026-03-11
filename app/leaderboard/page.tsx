import Link from 'next/link'
import { getAllUsers, getSlackProfile } from '@/lib/airtable'
import { RankBadges } from '@/app/components/RankBadge'

export const dynamic = 'force-dynamic'

export default async function LeaderboardPage() {
  const users = await getAllUsers()

  const sorted = [...users].sort((a, b) => b.projectCount - a.projectCount)

  const profiles = await Promise.all(
    sorted.map(async (user) => {
      const slack = await getSlackProfile(user.slackId)
      return { ...user, slack }
    })
  )

  return (
    <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-grub-fg0">Leaderboard</h1>
        <p className="text-sm text-grub-fg4 mt-1">
          {profiles.length} {profiles.length === 1 ? 'member' : 'members'}
        </p>
      </div>

      {profiles.length === 0 ? (
        <div className="text-center py-16 text-grub-fg4">
          <p className="text-lg">No members yet</p>
        </div>
      ) : (
        <div className="bg-grub-bg1 rounded-xl border border-grub-bg2 divide-y divide-grub-bg2 overflow-hidden">
          {profiles.map((user, index) => (
            <Link
              key={user.username}
              href={`/profile/${user.username}`}
              className="flex items-center gap-4 px-5 py-4 hover:bg-grub-bg2 transition-colors"
            >
              <span className="text-lg font-bold text-grub-bg4 w-8 text-center flex-shrink-0">
                {index + 1}
              </span>

              {user.slack?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.slack.avatarUrl}
                  alt={user.slack.displayName}
                  className="w-10 h-10 rounded-full border border-grub-bg3 flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-grub-bg3 flex-shrink-0" />
              )}

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-grub-fg0 truncate">
                  {user.slack?.displayName ?? user.username}
                </p>
                <RankBadges ranks={user.ranks} />
                <p className="text-xs text-grub-fg4">@{user.username}</p>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-grub-fg0">
                  {user.projectCount}
                </p>
                <p className="text-xs text-grub-fg4">
                  {user.projectCount === 1 ? 'project' : 'projects'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
