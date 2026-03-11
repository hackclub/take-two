import { Rank } from '@/lib/airtable'

export function RankBadges({ ranks }: { ranks: Rank[] }) {
  if (ranks.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1.5">
      {ranks.map((rank) => (
        <span
          key={rank.name}
          className="inline-block text-xs font-medium px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: `${rank.colorHex}20`,
            color: rank.colorHex,
          }}
        >
          {rank.name}
        </span>
      ))}
    </div>
  )
}
