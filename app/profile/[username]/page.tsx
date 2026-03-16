import { notFound } from 'next/navigation'
import { getUserProfileByUsername, getSlackProfile, ProfileProject } from '@/lib/airtable'
import { safeHref } from '@/lib/sanitize'
import { RankBadges } from '@/app/components/RankBadge'
import { groupByStatus } from '@/lib/status'

export const revalidate = 120 // 2 minutes

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
  const isVerified = project.status === 'built_verified'
  const codeUrl = safeHref(project.codeUrl)
  const demoUrl = safeHref(project.demoUrl)
  const blogUrl = safeHref(project.blogUrl)
  const cardUrl = codeUrl || demoUrl

  return (
    <div className={`relative bg-grub-bg1 rounded-xl border overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 ${isVerified ? 'border-grub-green/50 shadow-lg shadow-grub-green/20 ring-1 ring-grub-green/20 hover:border-grub-green hover:shadow-xl hover:shadow-grub-green/30' : 'border-grub-bg2 hover:border-grub-bg4 hover:shadow-lg hover:shadow-grub-bg/50'}`}>
      {cardUrl && (
        <a href={cardUrl} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-0" />
      )}
      {image && (
        <div className="aspect-video bg-grub-bg2 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image.url} alt={image.filename} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-5 space-y-3 flex flex-col flex-1">
        {project.ysws && (
          <span className="inline-block self-start text-xs font-medium px-2 py-0.5 rounded-full bg-grub-purple/20 text-grub-purple">
            {project.ysws}
          </span>
        )}

        {project.name && (
          <h3 className="font-semibold text-grub-fg0">{project.name}</h3>
        )}

        {project.description && (
          <p className="text-sm text-grub-fg3 line-clamp-3 flex-1">{project.description}</p>
        )}

        <div className="flex flex-wrap gap-2 relative z-10">
          {codeUrl && (
            <a
              href={codeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-grub-blue/20 text-grub-blue hover:bg-grub-blue/30 transition-colors"
            >
              View Repo
            </a>
          )}
          {demoUrl && (
            <a
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-grub-purple/20 text-grub-purple hover:bg-grub-purple/30 transition-colors"
            >
              Demo
            </a>
          )}
          {blogUrl && (
            <a
              href={blogUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-grub-yellow/20 text-grub-yellow hover:bg-grub-yellow/30 transition-colors"
            >
              Blog
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-grub-bg1 border border-grub-bg2 rounded-lg px-5 py-4 text-center">
      <p className="text-2xl font-bold text-grub-fg0">{value}</p>
      <p className="text-xs text-grub-fg4 mt-1">{label}</p>
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

  // Find earliest project date for "hacking since"
  const approvedDates = profile.projects
    .map((p) => p.approvedAt)
    .filter(Boolean) as string[]
  approvedDates.sort()
  const hackingSince = approvedDates.length > 0 ? approvedDates[0] : null

  return (
    <main className="max-w-5xl mx-auto px-6 py-12 space-y-10">
      <header className="flex items-start gap-6">
        {slackProfile?.avatarUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={slackProfile.avatarUrl}
            alt={slackProfile.displayName}
            className="w-24 h-24 rounded-full border-2 border-grub-bg3"
          />
        )}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-grub-fg0">
              {slackProfile?.displayName ?? profile.username}
            </h1>
            {profile.leaderboardPosition && (
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-grub-yellow/20 text-grub-yellow">
                #{profile.leaderboardPosition}
              </span>
            )}
          </div>

          <RankBadges ranks={profile.ranks} />

          <div className="flex items-center gap-3">
            <p className="text-sm text-grub-fg4">@{profile.username}</p>
            {safeHref(profile.githubUrl) && (
              <a
                href={safeHref(profile.githubUrl)!}
                target="_blank"
                rel="noopener noreferrer"
                className="text-grub-fg4 hover:text-grub-fg transition-colors"
                title="GitHub"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
            )}
            {safeHref(profile.websiteUrl) && (
              <a
                href={safeHref(profile.websiteUrl)!}
                target="_blank"
                rel="noopener noreferrer"
                className="text-grub-fg4 hover:text-grub-fg transition-colors"
                title="Website"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </a>
            )}
          </div>

          {profile.bio && (
            <p className="text-sm text-grub-fg2 max-w-lg leading-relaxed">{profile.bio}</p>
          )}
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {profile.leaderboardPosition && (
          <StatCard label="Leaderboard" value={`#${profile.leaderboardPosition}`} />
        )}
        <StatCard label="Projects" value={String(profile.projects.length)} />
        {hackingSince && (
          <StatCard label="Hacking For" value={formatDuration(hackingSince)} />
        )}
      </div>

      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-grub-fg0">Projects</h2>
        {profile.projects.length === 0 ? (
          <div className="text-center py-16 text-grub-fg4">
            <p className="text-lg">No projects yet</p>
          </div>
        ) : (
          groupByStatus(profile.projects).map((group) => (
            <div key={group.key} className="space-y-3">
              <h3 className="text-sm font-medium text-grub-fg4 uppercase tracking-wide">
                {group.label}
                <span className="ml-2 text-grub-fg4/60">{group.projects.length}</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  )
}
