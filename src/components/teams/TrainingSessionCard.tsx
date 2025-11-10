import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Trash2, Edit } from "lucide-react";
import { TrainingSession } from "@/hooks/useTrainingSessions";
import { format } from "date-fns";

interface TrainingSessionCardProps {
  session: TrainingSession;
  canEdit: boolean;
  onUpdate: (data: Partial<TrainingSession>) => void;
  onDelete: () => void;
}

export const TrainingSessionCard = ({
  session,
  canEdit,
  onDelete,
}: TrainingSessionCardProps) => {
  const startTime = new Date(session.start_time);
  const endTime = new Date(session.end_time);

  return (
    <Card className="p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
        <div className="flex-1 space-y-2 w-full min-w-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <h4 className="font-semibold text-sm sm:text-base truncate">{session.title}</h4>
            <Badge variant="outline" className="text-xs flex-shrink-0">
              {format(startTime, "HH:mm")} - {format(endTime, "HH:mm")}
            </Badge>
          </div>

          {session.description && (
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{session.description}</p>
          )}

          <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>
                {Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))} min
              </span>
            </div>
            {session.location && (
              <div className="flex items-center gap-1 min-w-0">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">{session.location}</span>
              </div>
            )}
          </div>
        </div>

        {canEdit && (
          <div className="flex gap-1 w-full sm:w-auto justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="text-destructive hover:text-destructive min-h-11 min-w-11"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
