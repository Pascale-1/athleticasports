import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Clock, MapPin, Trash2, ChevronDown, ChevronUp, Check, HelpCircle, X } from "lucide-react";
import { TrainingSession } from "@/hooks/useTrainingSessions";
import { TrainingSessionDetail } from "./TrainingSessionDetail";
import { format } from "date-fns";
import { useSessionAttendance } from "@/hooks/useSessionAttendance";

interface TrainingSessionCardProps {
  session: TrainingSession;
  canEdit: boolean;
  canManage: boolean;
  totalMembers: number;
  currentUserId?: string;
  onUpdate: (data: Partial<TrainingSession>) => void;
  onDelete: () => void;
}

export const TrainingSessionCard = ({
  session,
  canEdit,
  canManage,
  totalMembers,
  currentUserId,
  onDelete,
}: TrainingSessionCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { stats } = useSessionAttendance(session.id, totalMembers);
  const startTime = new Date(session.start_time);
  const endTime = new Date(session.end_time);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
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

            <div className="flex gap-1 mt-2">
              <Badge variant="secondary" className="text-xs bg-green-500 hover:bg-green-600 text-white">
                <Check className="h-3 w-3 mr-1" />
                {stats.attending}
              </Badge>
              <Badge variant="secondary" className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white">
                <HelpCircle className="h-3 w-3 mr-1" />
                {stats.maybe}
              </Badge>
              <Badge variant="destructive" className="text-xs">
                <X className="h-3 w-3 mr-1" />
                {stats.not_attending}
              </Badge>
            </div>
          </div>

          <div className="flex gap-1 w-full sm:w-auto justify-end">
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="min-h-9">
                {isOpen ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-2" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    View Details
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
            {canEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="text-destructive hover:text-destructive min-h-9 min-w-9"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <CollapsibleContent className="mt-4">
          <div className="border-t pt-4">
            <TrainingSessionDetail
              session={session}
              canManage={canManage}
              totalMembers={totalMembers}
              currentUserId={currentUserId}
            />
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
