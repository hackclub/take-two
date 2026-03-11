import { notFound } from 'next/navigation'
import { getUserProfileByUsername, getSlackProfile, ProfileProject } from '@/lib/airtable'
import { RankBadges } from '@/app/components/RankBadge'

export const dynamic = 'force-dynamic'

function formatDuration(firstDate: string): string {
  const start = new Date(firstDate)
  const now = new Date()
  const diffMs = now.getTime() - start.getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (days < 30) return `${days}d`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo`
  const years = Math.floor(months / 12)
  const rem = months % 12
  return rem > 0 ? `${years}y ${rem}mo` : `${years}y`
}

function ProjectCard({ project }: { project: ProfileProject }) {
  const image = project.pictures?.[0]

  return (
    <div className="bg-grub-bg1 rounded-xl border border-grub-bg2 overflow-hidden flex flex-col hover:border-grub-bg4 hover:shadow-lg hover:shadow-grub-bg/50 transition-all duration-200 hover:-translate-y-0.5">
      {image && (
        <div className="aspect-video bg-grub-bg2 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image.url} alt={image.filename} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-5 space-y-3 flex flex-col flex-1">
        {project.name && (
          <h3 className="font-semibold text-grub-fg0">{project.name}</h3>
        )}

        {project.description && (
          <p className="text-sm text-grub-fg3 line-clamp-3 flex-1">{project.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {project.codeUrl && (
            <a
              href={project.codeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-grub-blue/20 text-grub-blue hover:bg-grub-blue/30 transition-colors"
            >
              View Repo
            </a>
          )}
          {project.hoursSpent != null && (
            <span className="text-xs text-grub-fg4">{project.hoursSpent}h logged</span>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-grub-bg1 border border-grub-bg2 rounded-lg px-4 py-3 text-center">
      <p className="text-xl font-bold text-grub-fg0">{value}</p>
      <p className="text-xs text-grub-fg4 mt-0.5">{label}</p>
    </div>
  )
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params

  const profile = await getUserProfileByUsername(username)
  if (!profile) notFound()

  const slackProfile = await getSlackProfile(profile.slackId)

  const totalHours = profile.projects.reduce((sum, p) => sum + (p.hoursSpent ?? 0), 0)

  // Find earliest project date for "hacking since"
  const approvedDates = profile.projects
    .map((p) => p.approvedAt)
    .filter(Boolean) as string[]
  approvedDates.sort()
  const hackingSince = approvedDates.length > 0 ? approvedDates[0] : null

  return (
    <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      <header className="flex items-center gap-5">
        {slackProfile?.avatarUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={slackProfile.avatarUrl}
            alt={slackProfile.displayName}
            className="w-20 h-20 rounded-full border-2 border-grub-bg3"
          />
        )}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-grub-fg0">
              {slackProfile?.displayName ?? profile.username}
            </h1>
            {profile.leaderboardPosition && (
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-grub-yellow/20 text-grub-yellow">
                #{profile.leaderboardPosition}
              </span>
            )}
          </div>
          <RankBadges ranks={profile.ranks} />
          <p className="text-sm text-grub-fg4">@{profile.username}</p>
          {profile.bio && (
            <p className="text-sm text-grub-fg2 mt-2 max-w-lg">{profile.bio}</p>
          )}
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {profile.leaderboardPosition && (
          <StatCard label="Leaderboard" value={`#${profile.leaderboardPosition}`} />
        )}
        <StatCard label="Projects" value={String(profile.projects.length)} />
        {totalHours > 0 && (
          <StatCard label="Hours Logged" value={String(totalHours)} />
        )}
        {hackingSince && (
          <StatCard label="Hacking For" value={formatDuration(hackingSince)} />
        )}
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-grub-fg0">Projects</h2>
        {profile.projects.length === 0 ? (
          <div className="text-center py-16 text-grub-fg4">
            <p className="text-lg">No projects yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profile.projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
