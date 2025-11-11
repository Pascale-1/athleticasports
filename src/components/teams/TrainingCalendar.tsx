import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrainingSessionCard } from "./TrainingSessionCard";
import { CreateSessionDialog } from "./CreateSessionDialog";
import { Plus } from "lucide-react";
import { Event } from "@/lib/events";
import { isSameDay } from "date-fns";

interface TrainingCalendarProps {
  sessions: Event[];
  canCreateSession: boolean;
  canManage: boolean;
  currentUserId: string | null;
  totalMembers: number;
  teamId?: string;
  onCreateSession: (data: any) => void;
  onUpdateSession: (id: string, data: any) => void;
  onDeleteSession: (id: string) => void;
}

export const TrainingCalendar = ({
  sessions,
  canCreateSession,
  canManage,
  currentUserId,
  totalMembers,
  teamId,
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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4">
        <h3 className="heading-3">Training Schedule</h3>
        {canCreateSession && (
          <Button onClick={() => setIsCreateDialogOpen(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            New Session
          </Button>
        )}
      </div>

      <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-[300px_1fr] lg:gap-6">
        {/* Calendar Section */}
        <Card className="p-4">
          <div className="flex flex-col items-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md"
              modifiers={{
                hasSession: datesWithSessions,
              }}
              modifiersClassNames={{
                hasSession: "bg-primary/10 font-semibold text-primary",
              }}
            />
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Days with sessions are highlighted
            </p>
          </div>
        </Card>

        {/* Sessions List Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="heading-4">
              {selectedDate.toLocaleDateString("en-US", { 
                weekday: "long",
                month: "long", 
                day: "numeric",
                year: "numeric"
              })}
            </CardTitle>
            <CardDescription>
              {sessionsOnSelectedDate.length} session{sessionsOnSelectedDate.length !== 1 ? 's' : ''} scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sessionsOnSelectedDate.length > 0 ? (
              <div className="space-y-3">
                {sessionsOnSelectedDate.map((session) => (
                  <TrainingSessionCard
                    key={session.id}
                    session={session}
                    canEdit={canManage || currentUserId === session.created_by}
                    canManage={canManage}
                    totalMembers={totalMembers}
                    currentUserId={currentUserId || undefined}
                    onUpdate={(data) => onUpdateSession(session.id, data)}
                    onDelete={() => onDeleteSession(session.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground body-default mb-4">
                  No training sessions scheduled for this day
                </p>
                {canCreateSession && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Session
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CreateSessionDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateSession={onCreateSession}
        defaultDate={selectedDate}
        teamId={teamId}
      />
    </div>
  );
};
