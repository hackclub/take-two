function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-grub-bg2 rounded ${className ?? ''}`} />
}

export default function LeaderboardLoading() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
      <div>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-24 mt-2" />
      </div>

      <div className="space-y-2">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 bg-grub-bg1 rounded-xl border border-grub-bg2">
            <Skeleton className="h-6 w-8" />
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
    </main>
  )
}
