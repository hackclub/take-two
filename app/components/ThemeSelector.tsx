'use client'

import { useEffect, useState } from 'react'

const THEMES = [
  { id: 'gruvbox', label: 'Gruvbox' },
  { id: 'rosepine', label: 'Rosé Pine' },
  { id: 'rosepine-dawn', label: 'Dawn' },
  { id: 'catppuccin', label: 'Catppuccin' },
  { id: 'tokyonight', label: 'Tokyo Night' },
] as const

type ThemeId = (typeof THEMES)[number]['id']

export function ThemeSelector() {
  const [theme, setTheme] = useState<ThemeId>('gruvbox')

  useEffect(() => {
    const saved = localStorage.getItem('theme') as ThemeId | null
    if (saved && THEMES.some((t) => t.id === saved)) {
      setTheme(saved)
      document.documentElement.setAttribute('data-theme', saved)
    }
  }, [])

  function switchTheme(id: ThemeId) {
    setTheme(id)
    document.documentElement.setAttribute('data-theme', id)
    localStorage.setItem('theme', id)
  }

  return (
    <div className="flex items-center gap-1">
      {THEMES.map((t) => (
        <button
          key={t.id}
          onClick={() => switchTheme(t.id)}
          className={`text-xs px-2 py-1 rounded transition-colors ${
            theme === t.id
              ? 'bg-grub-bg2 text-grub-fg0'
              : 'text-grub-fg4 hover:text-grub-fg'
          }`}
          title={t.label}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
