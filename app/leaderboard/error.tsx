'use client'

import { useRouter } from 'next/navigation'

export default function LeaderboardError({ reset }: { reset: () => void }) {
  const router = useRouter()
  return (
    <main className="max-w-3xl mx-auto px-6 py-8 text-center space-y-4">
      <h1 className="text-2xl font-bold text-grub-fg0">Something went wrong</h1>
      <p className="text-sm text-grub-fg4">Failed to load the leaderboard. This usually resolves on its own.</p>
      <button
        onClick={() => { router.refresh(); reset() }}
        className="px-4 py-2 rounded-lg bg-grub-bg2 text-grub-fg0 hover:bg-grub-bg3 transition-colors text-sm"
      >
        Try again
      </button>
    </main>
  )
}
