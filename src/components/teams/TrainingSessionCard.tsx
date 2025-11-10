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
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">{session.title}</h4>
            <Badge variant="outline" className="text-xs">
              {format(startTime, "HH:mm")} - {format(endTime, "HH:mm")}
            </Badge>
          </div>

          {session.description && (
            <p className="text-sm text-muted-foreground">{session.description}</p>
          )}

          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>
                {Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))} min
              </span>
            </div>
            {session.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{session.location}</span>
              </div>
            )}
          </div>
        </div>

        {canEdit && (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
