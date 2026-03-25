'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export function EditableGithub({ initialUrl }: { initialUrl: string }) {
  const router = useRouter()
  const [url, setUrl] = useState(initialUrl)
  const [saved, setSaved] = useState(initialUrl)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleSave() {
    const trimmed = url.trim()
    if (trimmed === saved) {
      setEditing(false)
      setError('')
      return
    }

    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/github', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ githubUrl: trimmed }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to update')
        return
      }
      setSaved(trimmed)
      setUrl(trimmed)
      setEditing(false)
      router.refresh()
    } catch {
      setError('Failed to update')
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setUrl(saved)
    setEditing(false)
    setError('')
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 text-grub-fg4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
        {saved ? (
          <a
            href={saved}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-grub-fg4 hover:text-grub-fg transition-colors"
          >
            {saved.replace(/^https?:\/\/(www\.)?github\.com\//, '@')}
          </a>
        ) : (
          <span className="text-sm text-grub-fg4">Not linked</span>
        )}
        <button
          onClick={() => {
            setEditing(true)
            setTimeout(() => inputRef.current?.focus(), 0)
          }}
          className="text-xs text-grub-bg4 hover:text-grub-fg3 transition-colors"
        >
          (edit)
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <svg className="w-4 h-4 text-grub-fg4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          autoFocus
          placeholder="https://github.com/username"
          className="text-sm bg-grub-bg1 border border-grub-bg3 text-grub-fg rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-transparent w-full max-w-64 placeholder-grub-fg4"
        />
      </div>
      {error && <p className="text-xs text-grub-red">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={handleCancel}
          disabled={saving}
          className="text-xs text-grub-fg4 hover:text-grub-fg px-2 py-1"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-xs font-medium text-grub-bg bg-grub-red hover:bg-grub-red/80 rounded px-3 py-1 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  )
}
