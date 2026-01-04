import { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Attendee {
  user_id: string;
  status: string;
  is_committed?: boolean | null;
  responded_at?: string | null;
  profiles?: {
    avatar_url: string | null;
    display_name: string | null;
    username: string;
  } | null;
}

interface EventAttendeesProps {
  attendees: Attendee[];
  currentUserId: string | null;
}

const statusConfig = {
  attending: {
    label: "Going",
    icon: CheckCircle2,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  maybe: {
    label: "Maybe",
    icon: HelpCircle,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  not_attending: {
    label: "Can't Go",
    icon: XCircle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
};

const AvatarStack = ({ attendees, maxVisible = 5 }: { attendees: Attendee[]; maxVisible?: number }) => {
  const visible = attendees.slice(0, maxVisible);
  const remaining = attendees.length - maxVisible;

  return (
    <div className="flex -space-x-2">
      {visible.map((attendee) => (
        <Avatar key={attendee.user_id} className="h-8 w-8 border-2 border-background">
          <AvatarImage src={attendee.profiles?.avatar_url || ''} />
          <AvatarFallback className="text-xs">
            {attendee.profiles?.display_name?.[0] || attendee.profiles?.username?.[0] || '?'}
          </AvatarFallback>
        </Avatar>
      ))}
      {remaining > 0 && (
        <div className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium">
          +{remaining}
        </div>
      )}
    </div>
  );
};

const AttendeeGroup = ({ 
  status, 
  attendees, 
  currentUserId 
}: { 
  status: 'attending' | 'maybe' | 'not_attending';
  attendees: Attendee[]; 
  currentUserId: string | null;
}) => {
  const [expanded, setExpanded] = useState(false);
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  if (attendees.length === 0) return null;

  return (
    <div className="space-y-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn("p-1.5 rounded-full", config.bgColor)}>
            <StatusIcon className={cn("h-4 w-4", config.color)} />
          </div>
          <span className="font-medium text-sm">{config.label}</span>
          <Badge variant="secondary" className="text-xs">
            {attendees.length}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <AvatarStack attendees={attendees} maxVisible={3} />
          {attendees.length > 0 && (
            expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="pl-11 space-y-1">
          {attendees.map((attendee) => (
            <div
              key={attendee.user_id}
              className="flex items-center gap-3 p-2 rounded-lg"
            >
              <Avatar className="h-7 w-7">
                <AvatarImage src={attendee.profiles?.avatar_url || ''} />
                <AvatarFallback className="text-xs">
                  {attendee.profiles?.display_name?.[0] || attendee.profiles?.username?.[0] || '?'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm flex-1">
                {attendee.profiles?.display_name || attendee.profiles?.username || 'Unknown'}
                {attendee.user_id === currentUserId && (
                  <span className="text-muted-foreground ml-1">(You)</span>
                )}
              </span>
              {attendee.is_committed && (
                <Badge variant="secondary" className="text-xs bg-amber-500/20 text-amber-600">
                  ⭐ Committed
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const EventAttendees = ({ attendees, currentUserId }: EventAttendeesProps) => {
  const grouped = {
    attending: attendees.filter((a) => a.status === 'attending'),
    maybe: attendees.filter((a) => a.status === 'maybe'),
    not_attending: attendees.filter((a) => a.status === 'not_attending'),
  };

  if (attendees.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        No responses yet. Be the first to RSVP!
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <AttendeeGroup status="attending" attendees={grouped.attending} currentUserId={currentUserId} />
      <AttendeeGroup status="maybe" attendees={grouped.maybe} currentUserId={currentUserId} />
      <AttendeeGroup status="not_attending" attendees={grouped.not_attending} currentUserId={currentUserId} />
    </div>
  );
};
