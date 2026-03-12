function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-grub-bg2 rounded ${className ?? ''}`} />
}

export default function ProfileLoading() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-12 space-y-10">
      <header className="flex items-start gap-6">
        <Skeleton className="w-24 h-24 rounded-full" />
        <div className="space-y-3">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-64" />
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-grub-bg1 border border-grub-bg2 rounded-lg px-5 py-4 text-center">
            <Skeleton className="h-8 w-12 mx-auto" />
            <Skeleton className="h-3 w-16 mx-auto mt-2" />
          </div>
        ))}
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
