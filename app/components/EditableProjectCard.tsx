'use client'

import { useState } from 'react'

interface EditableProjectCardProps {
  projectId: string
  initialName: string
  initialDescription: string
}

export function EditableProjectCard({
  projectId,
  initialName,
  initialDescription,
}: EditableProjectCardProps) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription)
  const [savedName, setSavedName] = useState(initialName)
  const [savedDescription, setSavedDescription] = useState(initialDescription)
  const [saving, setSaving] = useState(false)

  async function saveField(field: 'project name' | 'description', value: string) {
    const res = await fetch('/api/project', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, field, value: value.trim() }),
    })
    if (!res.ok) throw new Error()
  }

  async function handleSave() {
    const trimmedName = name.trim()
    const trimmedDesc = description.trim()
    if (trimmedName === savedName && trimmedDesc === savedDescription) {
      setEditing(false)
      return
    }

    setSaving(true)
    try {
      const promises: Promise<void>[] = []
      if (trimmedName !== savedName) promises.push(saveField('project name', trimmedName))
      if (trimmedDesc !== savedDescription) promises.push(saveField('description', trimmedDesc))
      await Promise.all(promises)
      setSavedName(trimmedName)
      setSavedDescription(trimmedDesc)
      setName(trimmedName)
      setDescription(trimmedDesc)
      setEditing(false)
    } catch {
      // keep editing on failure
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setName(savedName)
    setDescription(savedDescription)
    setEditing(false)
  }

  if (!editing) {
    return (
      <>
        {savedName && (
          <h3 className="font-semibold text-grub-fg0">{savedName}</h3>
        )}
        {savedDescription && (
          <p className="text-sm text-grub-fg3 line-clamp-3 flex-1">{savedDescription}</p>
        )}
        {!savedName && !savedDescription && (
          <p className="text-sm text-grub-fg4 italic flex-1">No name or description</p>
        )}
        <button
          onClick={() => setEditing(true)}
          className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-grub-fg4/20 text-grub-fg4 hover:bg-grub-fg4/30 transition-colors relative z-10"
        >
          Edit
        </button>
      </>
    )
  }

  return (
    <div className="space-y-2 relative z-20" onClick={(e) => e.stopPropagation()}>
      <div>
        <label className="text-xs text-grub-fg4 mb-0.5 block">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 200))}
          maxLength={200}
          autoFocus
          placeholder="Project name..."
          className="w-full text-sm bg-grub-bg2 border border-grub-bg3 text-grub-fg rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-transparent placeholder-grub-fg4"
        />
      </div>
      <div>
        <label className="text-xs text-grub-fg4 mb-0.5 block">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
          maxLength={1000}
          rows={3}
          placeholder="Project description..."
          className="w-full text-sm bg-grub-bg2 border border-grub-bg3 text-grub-fg rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-transparent resize-none placeholder-grub-fg4"
        />
        <span className="text-xs text-grub-fg4">{description.length}/1000</span>
      </div>
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
