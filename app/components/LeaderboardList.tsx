'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { RankBadges } from '@/app/components/RankBadge'
import { STATUS_LABELS } from '@/lib/status'
import type { Rank } from '@/lib/airtable'

interface LeaderboardUser {
  username: string
  statusCounts: { built_verified: number; built_needs_revision: number; design_only: number }
  ranks: Rank[]
  avatarUrl?: string
  displayName?: string
}

interface PageData {
  users: LeaderboardUser[]
  page: number
  totalPages: number
  total: number
}

function UserRow({ user, rank }: { user: LeaderboardUser; rank: number }) {
  return (
    <Link
      href={`/profile/${user.username}`}
      className="flex items-center gap-4 px-5 py-4 hover:bg-grub-bg2 transition-colors"
    >
      <span className="text-lg font-bold text-grub-bg4 w-8 text-center flex-shrink-0">
        {rank}
      </span>

      {user.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.avatarUrl}
          alt={user.displayName || user.username}
          className="w-10 h-10 rounded-full border border-grub-bg3 flex-shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-grub-bg3 flex-shrink-0" />
      )}

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-grub-fg0 truncate">
          {user.displayName ?? user.username}
        </p>
        <RankBadges ranks={user.ranks} />
        <p className="text-xs text-grub-fg4">@{user.username}</p>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {(
          Object.entries(user.statusCounts) as [
            keyof typeof user.statusCounts,
            number,
          ][]
        )
          .filter(([, count]) => count > 0)
          .map(([status, count]) => (
            <span
              key={status}
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_LABELS[status]?.color ?? "bg-grub-bg2 text-grub-fg4"}`}
            >
              {count} {STATUS_LABELS[status]?.short ?? status}
            </span>
          ))}
      </div>
    </Link>
  )
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 animate-pulse">
      <div className="w-8 h-6 bg-grub-bg2 rounded flex-shrink-0" />
      <div className="w-10 h-10 rounded-full bg-grub-bg2 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-grub-bg2 rounded w-32" />
        <div className="h-3 bg-grub-bg2 rounded w-20" />
      </div>
    </div>
  )
}

export function LeaderboardList({ initialData }: { initialData: PageData }) {
  const [page, setPage] = useState(initialData.page)
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [cache, setCache] = useState<Map<number, PageData>>(
    () => new Map([[initialData.page, initialData]])
  )

  const fetchPage = useCallback(async (p: number) => {
    const cached = cache.get(p)
    if (cached) {
      setData(cached)
      setPage(p)
      return
    }

    setLoading(true)
    setPage(p)
    try {
      const res = await fetch(`/api/leaderboard?page=${p}`)
      const pageData: PageData = await res.json()
      setData(pageData)
      setCache((prev) => new Map(prev).set(p, pageData))
    } finally {
      setLoading(false)
    }
  }, [cache])

  // Prefetch next page
  useEffect(() => {
    if (page < data.totalPages && !cache.has(page + 1)) {
      fetch(`/api/leaderboard?page=${page + 1}`)
        .then((res) => res.json())
        .then((pageData: PageData) => {
          setCache((prev) => new Map(prev).set(page + 1, pageData))
        })
        .catch(() => {})
    }
  }, [page, data.totalPages, cache])

  const start = (page - 1) * 10

  return (
    <>
      <div className="bg-grub-bg1 rounded-xl border border-grub-bg2 divide-y divide-grub-bg2 overflow-hidden">
        {loading
          ? Array.from({ length: 10 }, (_, i) => <SkeletonRow key={i} />)
          : data.users.map((user, index) => (
              <UserRow key={user.username} user={user} rank={start + index + 1} />
            ))}
      </div>

      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <button
              onClick={() => fetchPage(page - 1)}
              disabled={loading}
              className="text-sm font-medium px-3 py-1.5 rounded-lg bg-grub-bg1 border border-grub-bg2 text-grub-fg4 hover:text-grub-fg hover:border-grub-bg4 transition-colors disabled:opacity-50"
            >
              Previous
            </button>
          )}
          <span className="text-sm text-grub-fg4 px-2">
            Page {page} of {data.totalPages}
          </span>
          {page < data.totalPages && (
            <button
              onClick={() => fetchPage(page + 1)}
              disabled={loading}
              className="text-sm font-medium px-3 py-1.5 rounded-lg bg-grub-bg1 border border-grub-bg2 text-grub-fg4 hover:text-grub-fg hover:border-grub-bg4 transition-colors disabled:opacity-50"
            >
              Next
            </button>
          )}
        </div>
      )}
    </>
  )
}
