import Link from 'next/link'

export function ShareButton({ username }: { username: string }) {
  return (
    <Link
      href={`/profile/${username}`}
      className="text-xs font-medium px-2 py-1 bg-grub-bg2 text-grub-fg3 rounded-full hover:bg-grub-bg3 transition-colors"
    >
      View profile
    </Link>
  )
}
