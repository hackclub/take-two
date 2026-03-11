import Link from 'next/link'
import { getAllUsers, getSlackProfile } from '@/lib/airtable'
import { Logo } from '@/app/components/Logo'

export const dynamic = 'force-dynamic'

export default async function BrowsePage() {
  const users = await getAllUsers()

  const profiles = await Promise.all(
    users.map(async (user) => {
      const slack = await getSlackProfile(user.slackId)
      return { ...user, slack }
    })
  )

  return (
    <main className="min-h-screen p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Logo />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profiles</h1>
          <p className="text-sm text-gray-500 mt-1">
            {profiles.length} {profiles.length === 1 ? 'member' : 'members'}
          </p>
        </div>

        {profiles.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg">No profiles yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {profiles.map((user) => (
              <Link
                key={user.username}
                href={`/profile/${user.username}`}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all flex items-center gap-4"
              >
                {user.slack?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.slack.avatarUrl}
                    alt={user.slack.displayName}
                    className="w-10 h-10 rounded-full border border-gray-200 flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {user.slack?.displayName ?? user.username}
                  </p>
                  <p className="text-xs text-gray-500">
                    @{user.username} &middot; {user.projectCount} {user.projectCount === 1 ? 'project' : 'projects'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
