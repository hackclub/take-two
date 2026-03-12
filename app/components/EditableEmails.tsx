'use client'

import { useState, useRef } from 'react'

export function EditableEmails({ initialEmails }: { initialEmails: string }) {
  const [emails, setEmails] = useState(initialEmails)
  const [saved, setSaved] = useState(initialEmails)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const lines = saved.split('\n').filter(Boolean)

  async function handleSave() {
    const trimmed = emails.trim()
    if (trimmed === saved) {
      setEditing(false)
      return
    }

    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/emails', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: trimmed }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Save failed')
        return
      }
      setSaved(trimmed)
      setEmails(trimmed)
      setEditing(false)
    } catch {
      setError('Save failed')
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setEmails(saved)
    setError('')
    setEditing(false)
  }

  if (!editing) {
    return (
      <div className="space-y-1">
        {lines.length > 0 ? (
          <ul className="space-y-0.5">
            {lines.map((email, i) => (
              <li key={i} className="text-sm text-grub-fg4">{email}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-grub-fg4 italic">No additional emails</p>
        )}
        <button
          onClick={() => {
            setEditing(true)
            setTimeout(() => textareaRef.current?.focus(), 0)
          }}
          className="text-xs text-grub-fg4 hover:text-grub-fg underline transition-colors"
        >
          {lines.length > 0 ? 'Edit emails' : 'Add emails'}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <textarea
        ref={textareaRef}
        value={emails}
        onChange={(e) => setEmails(e.target.value.slice(0, 2000))}
        maxLength={2000}
        rows={4}
        autoFocus
        className="w-full text-sm bg-grub-bg1 border border-grub-bg3 text-grub-fg rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-transparent resize-none placeholder-grub-fg4 font-mono"
        placeholder={"email1@example.com\nemail2@example.com"}
      />
      <p className="text-xs text-grub-fg4">One email per line, max 10</p>
      {error && <p className="text-xs text-grub-red">{error}</p>}
      <div className="flex gap-2 justify-end">
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
