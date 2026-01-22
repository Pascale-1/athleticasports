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
  const displayName = attendee.profiles?.display_name || attendee.profiles?.username || 'Unknown';
  const isCurrentUser = attendee.user_id === currentUserId;
  
  return (
    <div className="flex items-center gap-3 py-2">
      <Avatar className="h-8 w-8">
        <AvatarImage src={attendee.profiles?.avatar_url || ''} />
        <AvatarFallback className="text-xs bg-muted">
          {displayName[0]?.toUpperCase() || '?'}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm flex-1">
        {displayName}
        {isCurrentUser && (
          <span className="text-muted-foreground ml-1">{youLabel}</span>
        )}
      </span>
      {attendee.is_committed && (
        <Badge variant="secondary" className="text-xs bg-warning/20 text-warning-foreground">
          ⭐ {committedLabel}
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
      color: "text-warning",
      bgColor: "bg-warning/10",
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
    <div className="space-y-1">
      <div className="flex items-center gap-2 py-1">
        <div className={cn("p-1 rounded-full", cfg.bgColor)}>
          <StatusIcon className={cn("h-3.5 w-3.5", cfg.color)} />
        </div>
        <span className="text-sm font-medium text-muted-foreground">{cfg.label}</span>
        <span className="text-xs text-muted-foreground">({attendees.length})</span>
      </div>
      <div className="pl-7 space-y-0.5">
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

export const EventAttendees = ({ attendees, currentUserId }: EventAttendeesProps) => {
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
      <div className="text-center py-6 text-muted-foreground text-sm">
        {t('attendees.noResponses')}
      </div>
    );
  }

  const previewNames = previewAttendees
    .slice(0, 3)
    .map(a => {
      const name = a.profiles?.display_name || a.profiles?.username || '';
      return name.split(' ')[0];
    })
    .filter(Boolean);

  const othersCount = totalResponses - previewNames.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <span className="text-sm font-medium">{grouped.attending.length} {labels.going.toLowerCase()}</span>
        </div>
        {grouped.maybe.length > 0 && (
          <div className="flex items-center gap-1.5">
            <HelpCircle className="h-4 w-4 text-warning" />
            <span className="text-sm text-muted-foreground">{grouped.maybe.length} {labels.maybe.toLowerCase()}</span>
          </div>
        )}
        {grouped.not_attending.length > 0 && (
          <div className="flex items-center gap-1.5">
            <XCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-muted-foreground">{grouped.not_attending.length}</span>
          </div>
        )}
      </div>

      {previewAttendees.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {previewAttendees.map((attendee) => (
              <Avatar key={attendee.user_id} className="h-9 w-9 border-2 border-background ring-1 ring-border/50">
                <AvatarImage src={attendee.profiles?.avatar_url || ''} />
                <AvatarFallback className="text-xs bg-muted">
                  {(attendee.profiles?.display_name?.[0] || attendee.profiles?.username?.[0] || '?').toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
            {totalResponses > 5 && (
              <div className="h-9 w-9 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium ring-1 ring-border/50">
                +{totalResponses - 5}
              </div>
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            {previewNames.join(', ')}
            {othersCount > 0 && ` ${t('attendees.andOthers', { count: othersCount })}`}
          </span>
        </div>
      )}

      {totalResponses > 0 && (
        <>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-between hover:bg-muted/50 -mx-2 px-2"
            onClick={() => setShowAll(!showAll)}
          >
            <span className="text-sm">
              {showAll 
                ? t('attendees.hideDetails') 
                : t('attendees.seeAll', { count: totalResponses })}
            </span>
            {showAll ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          {showAll && (
            <div className="space-y-3 pt-2 border-t">
              <StatusSection status="attending" attendees={grouped.attending} currentUserId={currentUserId} labels={labels} />
              <StatusSection status="maybe" attendees={grouped.maybe} currentUserId={currentUserId} labels={labels} />
              <StatusSection status="not_attending" attendees={grouped.not_attending} currentUserId={currentUserId} labels={labels} />
            </div>
          )}
        </>
      )}
    </div>
  );
};