'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export function EditableUsername({ initialUsername }: { initialUsername: string }) {
  const router = useRouter()
  const [username, setUsername] = useState(initialUsername)
  const [saved, setSaved] = useState(initialUsername)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleSave() {
    const trimmed = username.trim().toLowerCase()
    if (trimmed === saved) {
      setEditing(false)
      setError('')
      return
    }

    if (!/^[a-z0-9._-]+$/.test(trimmed)) {
      setError('Only lowercase letters, numbers, dots, underscores, and hyphens')
      return
    }

    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/username', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmed }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to update')
        return
      }
      setSaved(trimmed)
      setUsername(trimmed)
      setEditing(false)
      router.refresh()
    } catch {
      setError('Failed to update')
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setUsername(saved)
    setEditing(false)
    setError('')
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-sm text-grub-fg4">@{saved}</span>
        <button
          onClick={() => {
            setEditing(true)
            setTimeout(() => inputRef.current?.focus(), 0)
          }}
          className="text-xs text-grub-bg4 hover:text-grub-fg3 transition-colors"
          title="Edit username"
        >
          (edit)
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <span className="text-sm text-grub-fg4">@</span>
        <input
          ref={inputRef}
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value.slice(0, 30).toLowerCase())}
          maxLength={30}
          autoFocus
          className="text-sm bg-grub-bg1 border border-grub-bg3 text-grub-fg rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-transparent w-full max-w-40"
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
