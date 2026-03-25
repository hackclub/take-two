import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import { Nav } from '@/app/components/Nav'
import './globals.css'

const outfit = Outfit({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Take Two',
  description: 'View your hardware projects',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{const t=localStorage.getItem('theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch{}` }} />
      </head>
      <body className={`${outfit.className} bg-grub-bg text-grub-fg min-h-screen`}>
        <Nav />
        {children}
      </body>
    </html>
  )
}
