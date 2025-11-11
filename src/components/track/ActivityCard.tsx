import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity } from "@/hooks/useActivities";
import { CircleDot, Bike, Dumbbell, Waves, Footprints, MoreHorizontal, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSwipe } from "@/hooks/useSwipe";
import { motion } from "framer-motion";

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
  const { swipeOffset, isSwiping, handleTouchStart, handleTouchMove, handleTouchEnd, resetSwipe } = useSwipe({
    onSwipeLeft: () => {},
    threshold: 60
  });

  const handleDelete = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onDelete(activity.id);
    resetSwipe();
  };

  return (
    <div className="relative">
      <motion.div
        className="absolute right-0 top-0 bottom-0 flex items-center justify-end pr-4 bg-destructive rounded-lg"
        initial={{ width: 0 }}
        animate={{ width: swipeOffset < -60 ? '80px' : 0 }}
        transition={{ duration: 0.2 }}
      >
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive-foreground"
          onClick={handleDelete}
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </motion.div>

      <motion.div
        animate={{ x: swipeOffset }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: isSwiping ? 'none' : 'auto' }}
      >
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
                  <DropdownMenuItem onClick={() => handleDelete()} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};