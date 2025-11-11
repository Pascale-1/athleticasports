import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const TeamCardSkeleton = () => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <Skeleton variant="avatar" className="h-16 w-16 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="h-5 w-3/4" />
            <Skeleton variant="text" className="h-4 w-1/2" />
          </div>
        </div>
        <Skeleton variant="text" className="h-4 w-full mb-2" />
        <Skeleton variant="text" className="h-4 w-5/6" />
      </CardContent>
    </Card>
  );
};
