export default function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="bg-bg-card border border-border rounded-2xl p-4 space-y-3 animate-pulse">
      <div className="h-4 bg-bg-elevated rounded-lg w-2/3" />
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <div key={i} className={`h-3 bg-bg-elevated rounded-lg ${i % 2 === 0 ? 'w-full' : 'w-4/5'}`} />
      ))}
    </div>
  )
}
