function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-grub-bg2 rounded ${className ?? ''}`} />
}

export default function DashboardLoading() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      <Skeleton className="h-9 w-48" />
      <header className="flex items-start justify-between gap-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-14 h-14 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </header>

      <div className="max-w-md space-y-4">
        <div>
          <Skeleton className="h-3 w-12 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div>
          <Skeleton className="h-3 w-12 mb-2" />
          <Skeleton className="h-5 w-48" />
        </div>
      </div>

      <section className="space-y-6">
        <Skeleton className="h-6 w-24" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-grub-bg1 rounded-xl border border-grub-bg2 overflow-hidden">
              <Skeleton className="aspect-video rounded-none" />
              <div className="p-5 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
