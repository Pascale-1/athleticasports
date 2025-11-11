import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity } from "@/hooks/useActivities";
import { CircleDot, Bike, Dumbbell, Waves, Footprints, MoreHorizontal, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface ActivityCardProps {
  activity: Activity;
  onDelete: (id: string) => void;
}

const activityIcons = {
  run: CircleDot,
  cycle: Bike,
  workout: Dumbbell,
  swim: Waves,
  walk: Footprints,
  other: MoreHorizontal,
};

const activityColors = {
  run: "text-orange-500",
  cycle: "text-blue-500",
  workout: "text-purple-500",
  swim: "text-cyan-500",
  walk: "text-green-500",
  other: "text-muted-foreground",
};

export const ActivityCard = ({ activity, onDelete }: ActivityCardProps) => {
  const Icon = activityIcons[activity.type];

  return (
    <Card className="hover-lift">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2 rounded-lg bg-accent ${activityColors[activity.type]}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold truncate">{activity.title}</h3>
                <Badge variant="outline" className="capitalize">{activity.type}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(activity.date), "MMM d, yyyy 'at' h:mm a")}
              </p>
              {activity.description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{activity.description}</p>
              )}
              <div className="flex flex-wrap gap-3 mt-3 text-sm">
                {activity.distance && (
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Distance:</span>
                    <span className="font-medium">{activity.distance} km</span>
                  </div>
                )}
                {activity.duration && (
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">{activity.duration} min</span>
                  </div>
                )}
                {activity.calories && (
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Calories:</span>
                    <span className="font-medium">{activity.calories}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onDelete(activity.id)} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};
