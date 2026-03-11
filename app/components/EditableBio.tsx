'use client'

import { useState, useRef } from 'react'

export function EditableBio({ initialBio }: { initialBio: string }) {
  const [bio, setBio] = useState(initialBio)
  const [saved, setSaved] = useState(initialBio)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  async function handleSave() {
    const trimmed = bio.trim()
    if (trimmed === saved) {
      setEditing(false)
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/bio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: trimmed }),
      })
      if (!res.ok) throw new Error()
      setSaved(trimmed)
      setBio(trimmed)
      setEditing(false)
    } catch {
      // keep editing on failure
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setBio(saved)
    setEditing(false)
  }

  if (!editing) {
    return (
      <button
        onClick={() => {
          setEditing(true)
          setTimeout(() => textareaRef.current?.focus(), 0)
        }}
        className="text-left text-sm text-grub-fg4 hover:text-grub-fg transition-colors"
      >
        {saved || 'Add a bio...'}
      </button>
    )
  }

  return (
    <div className="space-y-2">
      <textarea
        ref={textareaRef}
        value={bio}
        onChange={(e) => setBio(e.target.value.slice(0, 200))}
        maxLength={200}
        rows={2}
        autoFocus
        className="w-full text-sm bg-grub-bg1 border border-grub-bg3 text-grub-fg rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-transparent resize-none placeholder-grub-fg4"
        placeholder="Write a short bio..."
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-grub-fg4">{bio.length}/200</span>
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
    </div>
  )
}
