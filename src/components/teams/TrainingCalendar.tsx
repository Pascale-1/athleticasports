import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrainingSessionCard } from "./TrainingSessionCard";
import { CreateSessionDialog } from "./CreateSessionDialog";
import { EmptyState } from "@/components/EmptyState";
import { Plus, Dumbbell } from "lucide-react";
import { Event } from "@/lib/events";
import { isSameDay, isBefore } from "date-fns";
import { cn } from "@/lib/utils";

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
  const [activeFilter, setActiveFilter] = useState<'upcoming' | 'past'>('upcoming');

  const now = new Date();

  // Filter sessions by upcoming/past
  const filteredSessions = sessions.filter((session) => {
    const sessionDate = new Date(session.start_time);
    if (activeFilter === 'upcoming') {
      return !isBefore(sessionDate, now);
    }
    return isBefore(sessionDate, now);
  });

  const sessionsOnSelectedDate = filteredSessions.filter((session) =>
    isSameDay(new Date(session.start_time), selectedDate)
  );

  const datesWithSessions = filteredSessions.map((session) => new Date(session.start_time));

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

      {/* Segmented Toggle: À venir | Passés */}
      <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl sticky top-0 z-10">
        <button
          className={cn(
            "flex-1 h-9 rounded-lg text-xs font-medium transition-all active:scale-[0.98]",
            activeFilter === 'upcoming'
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setActiveFilter('upcoming')}
        >
          À venir
        </button>
        <button
          className={cn(
            "flex-1 h-9 rounded-lg text-xs font-medium transition-all active:scale-[0.98]",
            activeFilter === 'past'
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setActiveFilter('past')}
        >
          Passés
        </button>
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
                {sessionsOnSelectedDate.map((session) => {
                  const sessionIsPast = isBefore(new Date(session.start_time), now);
                  return (
                    <TrainingSessionCard
                      key={session.id}
                      session={session}
                      canEdit={canManage || currentUserId === session.created_by}
                      canManage={canManage}
                      totalMembers={totalMembers}
                      currentUserId={currentUserId || undefined}
                      isPast={sessionIsPast}
                      onUpdate={(data) => onUpdateSession(session.id, data)}
                      onDelete={() => onDeleteSession(session.id)}
                    />
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={Dumbbell}
                title="No sessions"
                description="No training sessions scheduled for this day"
                emoji="🏋️"
                action={canCreateSession ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Session
                  </Button>
                ) : undefined}
              />
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
