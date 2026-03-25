import Link from 'next/link'

export function Logo() {
  return (
    <Link href="/" className="text-lg font-semibold text-grub-fg0 hover:text-grub-red transition-colors">
      Take Two
    </Link>
  )
}
