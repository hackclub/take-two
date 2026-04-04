'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Pagination } from './Pagination'
import { STATUS_LABELS, STATUS_ORDER } from '@/lib/status'

interface GalleryProject {
  id: string
  name?: string
  description?: string
  pictures?: { url: string; filename: string }[]
  codeUrl?: string
  demoUrl?: string
  blogUrl?: string
  status?: string
  ysws?: string
  ownerUsername?: string
  ownerProfilePicture?: string
}

const PER_PAGE = 25

function safeUrl(url: string | undefined): string | undefined {
  if (!url) return undefined
  try {
    const parsed = new URL(url)
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return url
  } catch {}
  return undefined
}

function ProjectCard({ project }: { project: GalleryProject }) {
  const image = project.pictures?.[0]
  const isVerified = project.status === 'built_verified'
  const codeUrl = safeUrl(project.codeUrl)
  const demoUrl = safeUrl(project.demoUrl)
  const blogUrl = safeUrl(project.blogUrl)
  const cardUrl = codeUrl || demoUrl

  return (
    <div className={`relative bg-grub-bg1 rounded-md border overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 ${isVerified ? 'border-grub-green/50 shadow-lg shadow-grub-green/20 ring-1 ring-grub-green/20 hover:border-grub-green hover:shadow-xl hover:shadow-grub-green/30' : 'border-grub-bg2 hover:border-grub-bg4 hover:shadow-lg hover:shadow-grub-bg/50'}`}>
      {cardUrl && (
        <a href={cardUrl} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-0" />
      )}
      {image && (
        <div className="aspect-video bg-grub-bg2 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image.url} alt={image.filename} loading="lazy" className="w-full h-full object-cover" />
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
            <a href={codeUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-grub-blue/20 text-grub-blue hover:bg-grub-blue/30 transition-colors">
              View Repo
            </a>
          )}
          {demoUrl && (
            <a href={demoUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-grub-purple/20 text-grub-purple hover:bg-grub-purple/30 transition-colors">
              Demo
            </a>
          )}
          {blogUrl && (
            <a href={blogUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-grub-yellow/20 text-grub-yellow hover:bg-grub-yellow/30 transition-colors">
              Blog
            </a>
          )}
        </div>
        {project.ownerUsername && (
          <Link
            href={`/profile/${project.ownerUsername}`}
            className="flex items-center gap-2 pt-2 border-t border-grub-bg2 relative z-10"
          >
            {project.ownerProfilePicture && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={project.ownerProfilePicture} alt={project.ownerUsername} loading="lazy" className="w-6 h-6 rounded-full border border-grub-bg3" />
            )}
            <span className="text-xs text-grub-fg4 hover:text-grub-fg transition-colors">
              @{project.ownerUsername}
            </span>
          </Link>
        )}
      </div>
    </div>
  )
}

export function GalleryList({ projects }: { projects: GalleryProject[] }) {
  const [page, setPage] = useState(1)

  // Group by status
  type StatusKey = (typeof STATUS_ORDER)[number]
  const groups: { key: string; label: string; projects: GalleryProject[] }[] =
    STATUS_ORDER.map((key) => ({
      key,
      label: STATUS_LABELS[key].label,
      projects: [] as GalleryProject[],
    }))

  for (const p of projects) {
    const idx = STATUS_ORDER.indexOf((p.status ?? 'design_only') as StatusKey)
    if (idx >= 0) groups[idx].projects.push(p)
    else groups[groups.length - 1].projects.push(p)
  }

  // Flatten for pagination while preserving group structure
  const allOrdered = groups.flatMap((g) => g.projects)
  const totalPages = Math.max(1, Math.ceil(allOrdered.length / PER_PAGE))
  const start = (page - 1) * PER_PAGE
  const pageProjects = new Set(allOrdered.slice(start, start + PER_PAGE).map((p) => p.id))

  // Filter groups to only include projects on the current page
  const visibleGroups = groups
    .map((g) => ({
      ...g,
      projects: g.projects.filter((p) => pageProjects.has(p.id)),
    }))
    .filter((g) => g.projects.length > 0)

  return (
    <div className="space-y-8">
      {visibleGroups.map((group) => (
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

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  )
}
