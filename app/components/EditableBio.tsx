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
        className="text-left text-sm text-gray-500 hover:text-gray-700 transition-colors"
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
        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ec3750] focus:border-transparent resize-none"
        placeholder="Write a short bio..."
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{bio.length}/200</span>
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            disabled={saving}
            className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-xs font-medium text-white bg-[#ec3750] hover:bg-[#d42f45] rounded px-3 py-1 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
