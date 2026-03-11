'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export function EditableWebsite({ initialUrl }: { initialUrl: string }) {
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
      const res = await fetch('/api/website', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteUrl: trimmed }),
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
        <svg className="w-4 h-4 text-grub-fg4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        {saved ? (
          <a
            href={saved}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-grub-fg4 hover:text-grub-fg transition-colors"
          >
            {saved.replace(/^https?:\/\/(www\.)?/, '')}
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
        <svg className="w-4 h-4 text-grub-fg4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          autoFocus
          placeholder="https://yoursite.com"
          className="text-sm bg-grub-bg1 border border-grub-bg3 text-grub-fg rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-transparent w-64 placeholder-grub-fg4"
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
