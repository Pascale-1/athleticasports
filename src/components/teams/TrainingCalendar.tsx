import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { TrainingSessionCard } from "./TrainingSessionCard";
import { CreateSessionDialog } from "./CreateSessionDialog";
import { Plus } from "lucide-react";
import { TrainingSession } from "@/hooks/useTrainingSessions";
import { isSameDay } from "date-fns";

interface TrainingCalendarProps {
  sessions: TrainingSession[];
  canCreateSession: boolean;
  canManage: boolean;
  currentUserId: string | null;
  onCreateSession: (data: any) => void;
  onUpdateSession: (id: string, data: any) => void;
  onDeleteSession: (id: string) => void;
}

export const TrainingCalendar = ({
  sessions,
  canCreateSession,
  canManage,
  currentUserId,
  onCreateSession,
  onUpdateSession,
  onDeleteSession,
}: TrainingCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const sessionsOnSelectedDate = sessions.filter((session) =>
    isSameDay(new Date(session.start_time), selectedDate)
  );

  const datesWithSessions = sessions.map((session) => new Date(session.start_time));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Training Schedule</h3>
        {canCreateSession && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Session
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border"
            modifiers={{
              hasSession: datesWithSessions,
            }}
            modifiersClassNames={{
              hasSession: "bg-primary/10 font-semibold",
            }}
          />
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">
            Sessions on {selectedDate.toLocaleDateString("en-US", { 
              month: "long", 
              day: "numeric",
              year: "numeric"
            })}
          </h4>
          {sessionsOnSelectedDate.length > 0 ? (
            <div className="space-y-3">
              {sessionsOnSelectedDate.map((session) => (
                <TrainingSessionCard
                  key={session.id}
                  session={session}
                  canEdit={canManage || currentUserId === session.created_by}
                  onUpdate={(data) => onUpdateSession(session.id, data)}
                  onDelete={() => onDeleteSession(session.id)}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No training sessions scheduled for this day
            </p>
          )}
        </div>
      </div>

      <CreateSessionDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateSession={onCreateSession}
        defaultDate={selectedDate}
      />
    </div>
  );
};
