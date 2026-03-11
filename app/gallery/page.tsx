import Link from 'next/link'
import { getAllProjects, getSlackProfile, GalleryProject } from '@/lib/airtable'
import { groupByStatus } from '@/lib/status'

export const revalidate = 1800 // 30 minutes

function ProjectCard({ project }: { project: GalleryProject & { ownerAvatar?: string; ownerDisplayName?: string } }) {
  const image = project.pictures?.[0]
  const isVerified = project.status === 'built_verified'

  return (
    <div className={`bg-grub-bg1 rounded-xl border overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 ${isVerified ? 'border-grub-green/50 shadow-lg shadow-grub-green/20 ring-1 ring-grub-green/20 hover:border-grub-green hover:shadow-xl hover:shadow-grub-green/30' : 'border-grub-bg2 hover:border-grub-bg4 hover:shadow-lg hover:shadow-grub-bg/50'}`}>
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

        {project.codeUrl && (
          <a
            href={project.codeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block self-start text-xs font-medium px-3 py-1 rounded-full bg-grub-blue/20 text-grub-blue hover:bg-grub-blue/30 transition-colors"
          >
            View Repo
          </a>
        )}

        {project.ownerUsername && (
          <Link
            href={`/profile/${project.ownerUsername}`}
            className="flex items-center gap-2 pt-2 border-t border-grub-bg2"
          >
            {project.ownerAvatar && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={project.ownerAvatar}
                alt={project.ownerDisplayName || project.ownerUsername}
                className="w-6 h-6 rounded-full border border-grub-bg3"
              />
            )}
            <span className="text-xs text-grub-fg4 hover:text-grub-fg transition-colors">
              {project.ownerDisplayName || `@${project.ownerUsername}`}
            </span>
          </Link>
        )}
      </div>
    </div>
  )
}

export default async function GalleryPage() {
  const projects = await getAllProjects()

  const slackIds = [...new Set(projects.map((p) => p.ownerSlackId).filter(Boolean))] as string[]
  const slackProfiles = await Promise.all(
    slackIds.map(async (id) => {
      const profile = await getSlackProfile(id)
      return [id, profile] as const
    })
  )
  const slackMap = new Map(slackProfiles)

  const enriched = projects.map((p) => {
    const slack = p.ownerSlackId ? slackMap.get(p.ownerSlackId) : null
    return {
      ...p,
      ownerAvatar: slack?.avatarUrl ?? undefined,
      ownerDisplayName: slack?.displayName ?? undefined,
    }
  })

  return (
    <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-grub-fg0">Gallery</h1>
        <p className="text-sm text-grub-fg4 mt-1">
          {enriched.length} {enriched.length === 1 ? 'project' : 'projects'}
        </p>
      </div>

      {enriched.length === 0 ? (
        <div className="text-center py-16 text-grub-fg4">
          <p className="text-lg">No projects yet</p>
        </div>
      ) : (
        <div className="space-y-8">
          {groupByStatus(enriched).map((group) => (
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
          ))}
        </div>
      )}
    </main>
  )
}
