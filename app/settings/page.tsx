'use client'

import { useEffect, useState } from 'react'

const THEMES = [
  { id: 'gruvbox', label: 'Gruvbox', description: 'Warm, retro dark theme', colors: ['#282828', '#fb4934', '#b8bb26', '#fabd2f', '#83a598'] },
  { id: 'rosepine', label: 'Rosé Pine', description: 'Soho vibes dark theme', colors: ['#191724', '#eb6f92', '#9ccfd8', '#f6c177', '#c4a7e7'] },
  { id: 'rosepine-dawn', label: 'Rosé Pine Dawn', description: 'Soho vibes light theme', colors: ['#faf4ed', '#b4637a', '#56949f', '#ea9d34', '#907aa9'] },
  { id: 'catppuccin', label: 'Catppuccin Mocha', description: 'Soothing pastel dark theme', colors: ['#1e1e2e', '#f38ba8', '#a6e3a1', '#f9e2af', '#cba6f7'] },
  { id: 'tokyonight', label: 'Tokyo Night', description: 'Clean, dark neon theme', colors: ['#1a1b26', '#f7768e', '#9ece6a', '#e0af68', '#7aa2f7'] },
] as const

type ThemeId = (typeof THEMES)[number]['id']

export default function SettingsPage() {
  const [theme, setTheme] = useState<ThemeId>('gruvbox')

  useEffect(() => {
    const saved = localStorage.getItem('theme') as ThemeId | null
    if (saved && THEMES.some((t) => t.id === saved)) {
      setTheme(saved)
    }
  }, [])

  function switchTheme(id: ThemeId) {
    setTheme(id)
    document.documentElement.setAttribute('data-theme', id)
    localStorage.setItem('theme', id)
  }

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-grub-fg0">Settings</h1>
        <p className="text-sm text-grub-fg4 mt-1">Customize your experience</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-sm font-medium text-grub-fg4 uppercase tracking-wide">Theme</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => switchTheme(t.id)}
              className={`text-left p-4 rounded-md border-2 transition-all ${
                theme === t.id
                  ? 'border-grub-red bg-grub-bg1'
                  : 'border-grub-bg2 hover:border-grub-bg3 bg-grub-bg1'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-grub-fg0">{t.label}</span>
                {theme === t.id && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-grub-red/20 text-grub-red">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-grub-fg4 mb-3">{t.description}</p>
              <div className="flex gap-1.5">
                {t.colors.map((color) => (
                  <div
                    key={color}
                    className="w-6 h-6 rounded-full border border-grub-bg3"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      </section>
    </main>
  )
}
