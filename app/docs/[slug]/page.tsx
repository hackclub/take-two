import { notFound } from 'next/navigation'
import fs from 'fs'
import path from 'path'

const CONTENT_DIR = path.join(process.cwd(), 'app/content/docs')

export function generateStaticParams() {
  return fs.readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.mdx') && f !== 'index.mdx')
    .map((f) => ({ slug: f.replace(/\.mdx$/, '') }))
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // Validate slug to prevent path traversal
  if (!/^[a-z0-9_-]+$/.test(slug)) notFound()

  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) notFound()

  const { default: Content } = await import(`@/app/content/docs/${slug}.mdx`)
  return <Content />
}
