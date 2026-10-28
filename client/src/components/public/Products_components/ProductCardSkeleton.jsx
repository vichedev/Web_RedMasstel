export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
      <div className="aspect-square animate-pulse bg-gray-200" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
        <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="h-3 w-full animate-pulse rounded bg-gray-200" />
        <div className="h-6 w-20 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  );
}
