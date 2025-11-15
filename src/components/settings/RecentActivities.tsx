import { useActivities } from "@/hooks/useActivities";
import { ActivityCard } from "@/components/feed/ActivityCard";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const RecentActivities = () => {
  const { activities, loading } = useActivities();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const recentActivities = activities.slice(0, 5);

  if (recentActivities.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No activities yet</p>
        <Button
          onClick={() => navigate("/track")}
          className="mt-4"
          variant="outline"
        >
          Log Your First Activity
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recentActivities.map((activity) => (
        <ActivityCard
          key={activity.id}
          username="You"
          activityType={activity.title}
          timeAgo={new Date(activity.date).toLocaleDateString()}
          description={activity.description || undefined}
          achievements={[
            activity.distance ? `${activity.distance}km` : '',
            activity.duration ? `${activity.duration}min` : '',
            activity.calories ? `${activity.calories}cal` : '',
          ].filter(Boolean)}
        />
      ))}
      {activities.length > 5 && (
        <Button
          onClick={() => navigate("/track")}
          className="w-full"
          variant="outline"
        >
          View All Activities
        </Button>
      )}
    </div>
  );
};
