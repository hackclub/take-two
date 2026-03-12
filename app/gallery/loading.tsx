function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-grub-bg2 rounded ${className ?? ''}`} />
}

export default function GalleryLoading() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-20 mt-2" />
      </div>

      <div className="space-y-8">
        {[...Array(2)].map((_, g) => (
          <div key={g} className="space-y-3">
            <Skeleton className="h-4 w-32" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-grub-bg1 rounded-xl border border-grub-bg2 overflow-hidden">
                  <Skeleton className="aspect-video rounded-none" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex items-center gap-2 pt-2 border-t border-grub-bg2">
                      <Skeleton className="w-6 h-6 rounded-full" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
