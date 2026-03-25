'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ImpersonatePage() {
  if (process.env.NODE_ENV === 'production') return null

  const router = useRouter()
  const [slackId, setSlackId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/admin/impersonate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slackId }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong')
      return
    }

    router.push('/dashboard')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-sm w-full space-y-6">
        <div>
          <div className="inline-block text-xs font-medium px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full mb-3">
            Dev only
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Impersonate User</h1>
          <p className="mt-1 text-sm text-gray-500">
            Enter a Slack ID to view their projects
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={slackId}
            onChange={(e) => setSlackId(e.target.value)}
            placeholder="U01234ABCDE"
            className="w-full px-4 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#ec3750] focus:border-transparent"
            autoFocus
          />

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !slackId.trim()}
            className="w-full px-6 py-2.5 bg-[#ec3750] text-white font-semibold rounded hover:bg-[#d42f45] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Looking up…' : 'Impersonate'}
          </button>
        </form>

        <a href="/" className="block text-center text-sm text-gray-500 hover:text-gray-700 underline">
          ← Back
        </a>
      </div>
    </main>
  )
}
