import { getAllProjects } from '@/lib/airtable'
import { GalleryList } from '@/app/components/GalleryList'
import { proxyImageUrl } from '@/lib/image'

export const revalidate = 1800 // 30 minutes

export default async function GalleryPage() {
  const raw = await getAllProjects()
  const projects = raw.map(p => ({
    ...p,
    pictures: p.pictures?.map(pic => ({ ...pic, url: proxyImageUrl(pic.url) })),
    ownerProfilePicture: p.ownerProfilePicture ? proxyImageUrl(p.ownerProfilePicture) : undefined,
  }))

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-grub-fg0">Gallery</h1>
        <p className="text-sm text-grub-fg4 mt-1">
          {projects.length} {projects.length === 1 ? 'project' : 'projects'}
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16 text-grub-fg4">
          <p className="text-lg">No projects yet</p>
        </div>
      ) : (
        <GalleryList projects={projects} />
      )}
    </main>
  )
}
