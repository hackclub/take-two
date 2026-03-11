import type { Metadata } from 'next'
import { Nav } from '@/app/components/Nav'
import './globals.css'

export const metadata: Metadata = {
  title: 'Take Two',
  description: 'View your hardware projects',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-grub-bg text-grub-fg min-h-screen">
        <Nav />
        {children}
      </body>
    </html>
  )
}
