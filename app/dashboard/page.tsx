import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { SessionData, sessionOptions } from '@/lib/session'
import { getUserProfileBySlackId, getSlackProfile, ProfileProject } from '@/lib/airtable'
import { TabNav } from '@/app/components/TabNav'
import { SyncButton } from '@/app/components/SyncButton'
import { Logo } from '@/app/components/Logo'
import { EditableBio } from '@/app/components/EditableBio'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  design_only: { label: 'Design Only', color: 'bg-gray-100 text-gray-700' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700' },
  approved: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700' },
}

function ProjectCard({ project }: { project: ProfileProject }) {
  const image = project.pictures?.[0]
  const status = project.status ? STATUS_LABELS[project.status] ?? { label: project.status, color: 'bg-gray-100 text-gray-700' } : null

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col">
      {image && (
        <div className="aspect-video bg-gray-100 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image.url} alt={image.filename} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-5 space-y-3 flex flex-col flex-1">
        {status && (
          <span className={`inline-block self-start text-xs font-medium px-2 py-0.5 rounded-full ${status.color}`}>
            {status.label}
          </span>
        )}

        {project.name && (
          <h3 className="font-semibold text-gray-900">{project.name}</h3>
        )}

        {project.description && (
          <p className="text-sm text-gray-700 line-clamp-3 flex-1">{project.description}</p>
        )}

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

export default async function Dashboard() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  if (!session.email) redirect('/')

  const [profile, slackProfile] = await Promise.all([
    session.slackId ? getUserProfileBySlackId(session.slackId) : null,
    session.slackId ? getSlackProfile(session.slackId) : null,
  ])

  const projects = profile?.projects ?? []
  const bio = profile?.bio ?? ''

  return (
    <main className="min-h-screen p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {slackProfile?.avatarUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={slackProfile.avatarUrl}
                alt={slackProfile.displayName}
                className="w-14 h-14 rounded-full border border-gray-200"
              />
            )}
            <div className="space-y-1">
              <Logo />
              <h1 className="text-2xl font-bold text-gray-900">
                {slackProfile?.displayName ?? session.name}
              </h1>
              <p className="text-sm text-gray-500">
                {session.email}
              </p>
              <div className="max-w-sm">
                <EditableBio initialBio={bio} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 self-start">
            <SyncButton />
            {process.env.NODE_ENV !== 'production' && (
              <a href="/admin/impersonate" className="text-xs font-medium px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full hover:bg-yellow-200 transition-colors">
                Impersonate
              </a>
            )}
            <a href="/api/auth/logout" className="text-sm text-gray-500 hover:text-gray-700 underline">
              Sign out
            </a>
          </div>
        </header>

        <TabNav active="projects" />

        {projects.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg">No projects yet</p>
          </div>
        )}

        {projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
