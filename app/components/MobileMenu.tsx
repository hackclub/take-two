'use client'

import { useState } from 'react'
import Link from 'next/link'

export function MobileMenu({ signedIn, seasonBadge }: { signedIn: boolean; seasonBadge: string | null }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="text-grub-fg4 hover:text-grub-fg p-1"
        aria-label="Toggle menu"
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>
      {open && (
        <div className="absolute top-14 left-0 right-0 bg-grub-bg border-b border-grub-bg2 px-6 py-4 space-y-3 z-50">
          {seasonBadge && (
            <span className="inline-block text-xs font-medium px-2.5 py-0.5 rounded-full bg-grub-red/20 text-grub-red">
              {seasonBadge}
            </span>
          )}
          <Link href="/gallery" onClick={() => setOpen(false)} className="block text-sm font-medium text-grub-fg4 hover:text-grub-fg transition-colors">
            Gallery
          </Link>
          <Link href="/leaderboard" onClick={() => setOpen(false)} className="block text-sm font-medium text-grub-fg4 hover:text-grub-fg transition-colors">
            Leaderboard
          </Link>
          <Link href="/docs" onClick={() => setOpen(false)} className="block text-sm font-medium text-grub-fg4 hover:text-grub-fg transition-colors">
            Docs
          </Link>
          {signedIn ? (
            <Link href="/dashboard" onClick={() => setOpen(false)} className="block text-sm font-medium text-grub-bg bg-grub-red hover:bg-grub-red/80 px-4 py-1.5 rounded transition-colors text-center">
              Dashboard
            </Link>
          ) : (
            <a href="/api/auth/login" className="block text-sm font-medium text-grub-bg bg-grub-red hover:bg-grub-red/80 px-4 py-1.5 rounded transition-colors text-center">
              Sign in
            </a>
          )}
          <Link href="/settings" onClick={() => setOpen(false)} className="block text-sm font-medium text-grub-fg4 hover:text-grub-fg transition-colors">
            Settings
          </Link>
        </div>
      )}
    </div>
  )
}
