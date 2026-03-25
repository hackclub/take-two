'use client'

export default function ProfileError() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-12 text-center space-y-4">
      <h1 className="text-2xl font-semibold text-grub-fg0">Something went wrong</h1>
      <p className="text-sm text-grub-fg4">Failed to load this profile. This usually resolves on its own.</p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 rounded bg-grub-bg2 text-grub-fg0 hover:bg-grub-bg3 transition-colors text-sm"
      >
        Try again
      </button>
    </main>
  )
}
