import { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface Attendee {
  user_id: string;
  status: string;
  is_committed?: boolean | null;
  has_paid?: boolean | null;
  responded_at?: string | null;
  profiles_public?: {
    avatar_url: string | null;
    display_name: string | null;
    username: string;
  } | null;
}

interface EventAttendeesProps {
  attendees: Attendee[];
  currentUserId: string | null;
  isPaidEvent?: boolean;
}

const AttendeeRow = ({ 
  attendee, 
  currentUserId,
  youLabel,
  committedLabel
}: { 
  attendee: Attendee; 
  currentUserId: string | null;
  youLabel: string;
  committedLabel: string;
}) => {
  const rawName = attendee.profiles?.display_name || attendee.profiles?.username || 'Player';
  const displayName = rawName.startsWith('user_') ? 'Player' : rawName;
  const isCurrentUser = attendee.user_id === currentUserId;
  
  return (
    <div className="flex items-center gap-2 py-1">
      <Avatar className="h-5 w-5">
        <AvatarImage src={attendee.profiles?.avatar_url || ''} />
        <AvatarFallback className="text-[9px] bg-muted">
          {displayName[0]?.toUpperCase() || '?'}
        </AvatarFallback>
      </Avatar>
      <span className="text-xs flex-1">
        {displayName}
        {isCurrentUser && (
          <span className="text-muted-foreground ml-1">{youLabel}</span>
        )}
      </span>
      {attendee.is_committed && (
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-primary/20 text-primary">
          ⭐ {committedLabel}
        </Badge>
      )}
      {attendee.has_paid && (
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-success/20 text-success">
          ✓ Paid
        </Badge>
      )}
    </div>
  );
};

const StatusSection = ({ 
  status, 
  attendees, 
  currentUserId,
  labels
}: { 
  status: 'attending' | 'maybe' | 'not_attending';
  attendees: Attendee[]; 
  currentUserId: string | null;
  labels: { going: string; maybe: string; cantGo: string; you: string; committed: string };
}) => {
  const config = {
    attending: {
      label: labels.going,
      icon: CheckCircle2,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    maybe: {
      label: labels.maybe,
      icon: HelpCircle,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    not_attending: {
      label: labels.cantGo,
      icon: XCircle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  };

  const cfg = config[status];
  const StatusIcon = cfg.icon;

  if (attendees.length === 0) return null;

  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-1.5 py-0.5">
        <div className={cn("p-0.5 rounded-full", cfg.bgColor)}>
          <StatusIcon className={cn("h-3 w-3", cfg.color)} />
        </div>
        <span className="text-xs font-medium text-muted-foreground">{cfg.label}</span>
        <span className="text-[10px] text-muted-foreground">({attendees.length})</span>
      </div>
      <div className="pl-6 space-y-0">
        {attendees.map((attendee) => (
          <AttendeeRow 
            key={attendee.user_id} 
            attendee={attendee} 
            currentUserId={currentUserId}
            youLabel={labels.you}
            committedLabel={labels.committed}
          />
        ))}
      </div>
    </div>
  );
};

export const EventAttendees = ({ attendees, currentUserId, isPaidEvent }: EventAttendeesProps) => {
  const { t } = useTranslation('events');
  const [showAll, setShowAll] = useState(false);
  
  const labels = {
    going: t('attendees.going'),
    maybe: t('attendees.maybe'),
    cantGo: t('attendees.cantGo'),
    you: t('attendees.you'),
    committed: t('attendees.committed'),
  };
  
  const grouped = {
    attending: attendees.filter((a) => a.status === 'attending'),
    maybe: attendees.filter((a) => a.status === 'maybe'),
    not_attending: attendees.filter((a) => a.status === 'not_attending'),
  };

  const previewAttendees = [...grouped.attending, ...grouped.maybe].slice(0, 5);
  const totalResponses = attendees.length;

  if (attendees.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground text-xs">
        {t('attendees.noResponses')}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Single merged summary row: avatars left, counts right */}
      <div className="flex items-center justify-between">
        <div className="flex -space-x-1.5">
          {previewAttendees.map((attendee) => (
            <Avatar key={attendee.user_id} className="h-5 w-5 border-2 border-background ring-1 ring-border/50">
              <AvatarImage src={attendee.profiles?.avatar_url || ''} />
              <AvatarFallback className="text-[8px] bg-muted">
                {(attendee.profiles?.display_name?.[0] || attendee.profiles?.username?.[0] || '?').toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ))}
          {totalResponses > 5 && (
            <div className="h-5 w-5 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[8px] font-medium ring-1 ring-border/50">
              +{totalResponses - 5}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-success" />
            <span className="text-xs font-medium">{grouped.attending.length}</span>
          </div>
          {grouped.maybe.length > 0 && (
            <div className="flex items-center gap-1">
              <HelpCircle className="h-3 w-3 text-primary" />
              <span className="text-xs text-muted-foreground">{grouped.maybe.length}</span>
            </div>
          )}
          {grouped.not_attending.length > 0 && (
            <div className="flex items-center gap-1">
              <XCircle className="h-3 w-3 text-destructive" />
              <span className="text-xs text-muted-foreground">{grouped.not_attending.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Always-collapsed toggle */}
      <Button 
        variant="ghost" 
        size="sm" 
        className="w-full justify-between hover:bg-muted/50 -mx-2 px-2 h-7"
        onClick={() => setShowAll(!showAll)}
      >
        <span className="text-xs">
          {showAll 
            ? t('attendees.hideDetails') 
            : t('attendees.seeAll', { count: totalResponses })}
        </span>
        {showAll ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </Button>

      {showAll && (
        <div className="space-y-2 pt-1 border-t max-h-48 overflow-y-auto">
          <StatusSection status="attending" attendees={grouped.attending} currentUserId={currentUserId} labels={labels} />
          <StatusSection status="maybe" attendees={grouped.maybe} currentUserId={currentUserId} labels={labels} />
          <StatusSection status="not_attending" attendees={grouped.not_attending} currentUserId={currentUserId} labels={labels} />
        </div>
      )}
    </div>
  );
};
