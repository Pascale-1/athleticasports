import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const FeedSkeleton = () => {
  return (
    <div className="space-y-2.5">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="overflow-hidden">
          {/* Header */}
          <div className="p-2.5 flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-2.5 w-20" />
            </div>
          </div>

          {/* Image */}
          <Skeleton className="w-full aspect-[16/9]" />

          {/* Content */}
          <div className="p-2.5 space-y-1.5">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>

          {/* Actions */}
          <div className="px-2.5 py-1.5 border-t border-border/50 flex gap-3">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-10" />
          </div>
        </Card>
      ))}
    </div>
  );
};
