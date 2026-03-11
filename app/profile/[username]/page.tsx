import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getUserProfileByUsername, getSlackProfile, ProfileProject } from '@/lib/airtable'
import { Logo } from '@/app/components/Logo'

const BROWSE_PATH = '/browse'

function ProjectCard({ project }: { project: ProfileProject }) {
  const image = project.pictures?.[0]

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col">
      {image && (
        <div className="aspect-video bg-gray-100 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image.url} alt={image.filename} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-5 space-y-3 flex flex-col flex-1">
        {project.name && (
          <h3 className="font-semibold text-gray-900">{project.name}</h3>
        )}

        {project.description && (
          <p className="text-sm text-gray-700 line-clamp-3 flex-1">{project.description}</p>
        )}

        <div className="flex flex-wrap gap-3 text-sm text-gray-500">
          {project.hoursSpent != null && <span>{project.hoursSpent}h spent</span>}
          {project.approvedAt && (
            <span>Approved {new Date(project.approvedAt).toLocaleDateString()}</span>
          )}
        </div>

        {project.codeUrl && (
          <a
            href={project.codeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-[#ec3750] hover:underline"
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
    <main className="min-h-screen p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Logo />
          <Link href={BROWSE_PATH} className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            &larr; All Profiles
          </Link>
        </div>

        <header className="flex items-center gap-5">
          {slackProfile?.avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={slackProfile.avatarUrl}
              alt={slackProfile.displayName}
              className="w-16 h-16 rounded-full border border-gray-200"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {slackProfile?.displayName ?? profile.username}
            </h1>
            <p className="text-sm text-gray-500">@{profile.username}</p>
            {profile.bio && (
              <p className="text-sm text-gray-600 mt-1">{profile.bio}</p>
            )}
          </div>
        </header>

        {profile.projects.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg">No projects yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profile.projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
