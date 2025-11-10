import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const FeedSkeleton = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="overflow-hidden">
          {/* Header */}
          <div className="p-4 flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>

          {/* Image */}
          <Skeleton className="w-full aspect-[16/9]" />

          {/* Content */}
          <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Actions */}
          <div className="px-4 py-3 border-t border-border/50 flex gap-4">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-12" />
          </div>
        </Card>
      ))}
    </div>
  );
};
