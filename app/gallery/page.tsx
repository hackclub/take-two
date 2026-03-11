import Link from 'next/link'
import { getAllProjects, getSlackProfile, GalleryProject } from '@/lib/airtable'

export const dynamic = 'force-dynamic'

function ProjectCard({ project }: { project: GalleryProject & { ownerAvatar?: string; ownerDisplayName?: string } }) {
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enriched.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </main>
  )
}
