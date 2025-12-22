import { Skeleton } from "@/components/ui/skeleton";

export function CategoryTilesSkeleton() {
  return (
    <div className="relative bg-white dark:bg-zinc-950">
      <div className="flex gap-2 overflow-x-auto py-3 px-4 sm:px-6 lg:px-8 scrollbar-hide">
        {/* All Products tile skeleton */}
        <div className="flex-shrink-0 overflow-hidden rounded-lg">
          <Skeleton className="h-10 w-32 sm:h-12 sm:w-40" />
        </div>
        
        {/* Category tiles skeletons */}
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 overflow-hidden rounded-lg">
            <Skeleton className="h-10 w-32 sm:h-12 sm:w-40" />
          </div>
        ))}
      </div>
    </div>
  );
}
