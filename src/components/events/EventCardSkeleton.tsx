import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const EventCardSkeleton = () => {
  return (
    <Card className="border-l-[5px] border-l-muted overflow-hidden">
      <div className="flex gap-0 p-0">
        <div className="flex flex-col items-center justify-center px-3 py-3 shrink-0">
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
        <div className="w-px bg-border shrink-0" />
        <div className="flex-1 px-3 py-2.5 space-y-2">
          <Skeleton variant="text" className="h-4 w-3/4" />
          <Skeleton variant="text" className="h-3 w-1/2" />
          <div className="flex items-center justify-between pt-1">
            <Skeleton variant="text" className="h-3 w-20" />
            <Skeleton className="h-7 w-16 rounded-full" />
          </div>
        </div>
      </div>
    </Card>
  );
};
