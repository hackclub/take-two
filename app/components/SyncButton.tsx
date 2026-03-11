'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function SyncButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<'success' | 'error' | null>(null)

  async function handleSync() {
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/sync', { method: 'POST' })
      if (!res.ok) throw new Error()
      setResult('success')
      router.refresh()
    } catch {
      setResult('error')
    } finally {
      setLoading(false)
      setTimeout(() => setResult(null), 3000)
    }
  }

  return (
    <button
      onClick={handleSync}
      disabled={loading}
      className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
    >
      {loading ? 'Syncing…' : result === 'success' ? 'Synced!' : result === 'error' ? 'Sync failed' : 'Re-sync projects'}
    </button>
  )
}
