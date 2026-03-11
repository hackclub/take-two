import Link from 'next/link'

export function Logo() {
  return (
    <Link href="/" className="text-lg font-bold text-grub-fg0 hover:text-grub-red transition-colors">
      Take Two
    </Link>
  )
}
