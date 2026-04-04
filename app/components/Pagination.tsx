'use client'

import { useState } from 'react'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  disabled?: boolean
}

export function Pagination({ page, totalPages, onPageChange, disabled }: PaginationProps) {
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState(String(page))

  function handleSubmit() {
    const num = parseInt(input, 10)
    if (num >= 1 && num <= totalPages) {
      onPageChange(num)
    } else {
      setInput(String(page))
    }
    setEditing(false)
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={disabled || page <= 1}
        className="text-sm font-medium px-3 py-1.5 rounded bg-grub-bg1 border border-grub-bg2 text-grub-fg4 hover:text-grub-fg hover:border-grub-bg4 transition-colors disabled:opacity-50 disabled:pointer-events-none"
      >
        Previous
      </button>
      {editing ? (
        <form
          onSubmit={(e) => { e.preventDefault(); handleSubmit() }}
          className="flex items-center gap-1"
        >
          <input
            type="number"
            min={1}
            max={totalPages}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onBlur={handleSubmit}
            autoFocus
            className="w-12 text-center text-sm bg-grub-bg1 border border-grub-bg3 text-grub-fg rounded px-1 py-1 focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-transparent"
          />
          <span className="text-sm text-grub-fg4">of {totalPages}</span>
        </form>
      ) : (
        <button
          onClick={() => { setInput(String(page)); setEditing(true) }}
          className="text-sm text-grub-fg4 px-2 py-1 hover:text-grub-fg hover:bg-grub-bg1 rounded transition-colors"
          title="Click to jump to a page"
        >
          {page} / {totalPages}
        </button>
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={disabled || page >= totalPages}
        className="text-sm font-medium px-3 py-1.5 rounded bg-grub-bg1 border border-grub-bg2 text-grub-fg4 hover:text-grub-fg hover:border-grub-bg4 transition-colors disabled:opacity-50 disabled:pointer-events-none"
      >
        Next
      </button>
    </div>
  )
}
