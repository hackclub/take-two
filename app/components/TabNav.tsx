import Link from 'next/link'

export function TabNav({ active }: { active: 'projects' }) {
  const tabs = [
    { id: 'projects', label: 'Projects', href: '/dashboard' },
  ] as const

  return (
    <nav className="flex gap-1 border-b border-gray-200">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={tab.href}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            active === tab.id
              ? 'border-[#ec3750] text-[#ec3750]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  )
}
