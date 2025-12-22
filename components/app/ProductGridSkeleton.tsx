import { Skeleton } from "@/components/ui/skeleton";

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2 @md:grid-cols-3 @xl:grid-cols-4 @5xl:grid-cols-5 @7xl:grid-cols-6 @md:gap-3">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
        >
          <Skeleton className="aspect-[4/3] w-full" />
          <div className="space-y-2 p-2">
            <Skeleton className="h-3 w-4/5" />
            <div className="flex items-center justify-between gap-1">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-3 w-8 rounded-sm" />
            </div>
            <Skeleton className="h-8 w-full rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

