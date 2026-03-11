import { notFound } from 'next/navigation'
import { getUserProfileByUsername, getSlackProfile, ProfileProject } from '@/lib/airtable'
import { RankBadges } from '@/app/components/RankBadge'

export const dynamic = 'force-dynamic'

function ProjectCard({ project }: { project: ProfileProject }) {
  const image = project.pictures?.[0]

  return (
    <div className="bg-grub-bg1 rounded-xl border border-grub-bg2 overflow-hidden flex flex-col">
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

        {project.codeUrl && (
          <a
            href={project.codeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-grub-blue hover:underline"
          >
            View Code →
          </a>
        )}
      </div>
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

  return (
    <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      <header className="flex items-center gap-5">
        {slackProfile?.avatarUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={slackProfile.avatarUrl}
            alt={slackProfile.displayName}
            className="w-16 h-16 rounded-full border border-grub-bg3"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold text-grub-fg0">
            {slackProfile?.displayName ?? profile.username}
          </h1>
          <RankBadges ranks={profile.ranks} />
          <p className="text-sm text-grub-fg4">@{profile.username}</p>
          {profile.bio && (
            <p className="text-sm text-grub-fg2 mt-1">{profile.bio}</p>
          )}
        </div>
      </header>

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
    </main>
  )
}
