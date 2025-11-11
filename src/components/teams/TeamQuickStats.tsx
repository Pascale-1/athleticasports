import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TeamQuickStatsProps {
  eventCount: number;
  activeMemberCount: number;
  weeklyPosts: number;
  loading?: boolean;
}

export const TeamQuickStats = ({ eventCount, activeMemberCount, weeklyPosts, loading }: TeamQuickStatsProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4 text-center">
              <Skeleton className="h-8 w-8 mx-auto mb-2 rounded-full" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-3 w-3/4 mx-auto" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      <Card>
        <CardContent className="p-4 text-center">
          <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold">{eventCount}</p>
          <p className="text-caption text-muted-foreground">Events</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold">{activeMemberCount}</p>
          <p className="text-caption text-muted-foreground">Members</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold">{weeklyPosts}</p>
          <p className="text-caption text-muted-foreground">Posts</p>
        </CardContent>
      </Card>
    </div>
  );
};
