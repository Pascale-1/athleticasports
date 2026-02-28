import { CheckCircle2, HelpCircle, XCircle, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isPast } from "date-fns";
import { useTranslation } from "react-i18next";

interface EventRSVPBarProps {
  userStatus: string | null;
  isCommitted: boolean;
  stats: {
    attending: number;
    maybe: number;
    not_attending: number;
  };
  onUpdateAttendance: (status: 'attending' | 'maybe' | 'not_attending') => void;
  onRemoveAttendance: () => void;
  loading?: boolean;
  rsvpDeadline?: string | null;
}

export const EventRSVPBar = ({
  userStatus,
  isCommitted,
  stats,
  onUpdateAttendance,
  onRemoveAttendance,
  loading = false,
  rsvpDeadline,
}: EventRSVPBarProps) => {
  const { t } = useTranslation('events');
  
  const handleClick = (status: 'attending' | 'maybe' | 'not_attending') => {
    if (userStatus === status) {
      onRemoveAttendance();
    } else {
      onUpdateAttendance(status);
    }
  };

  const isDeadlinePassed = rsvpDeadline ? isPast(new Date(rsvpDeadline)) : false;

  if (loading) {
    return (
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-background/95 backdrop-blur border-t p-3 lg:bottom-0 lg:relative lg:border lg:rounded-lg lg:bg-card">
        <div className="flex items-center justify-center h-11">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (isCommitted) {
    return (
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-background/95 backdrop-blur border-t p-3 lg:bottom-0 lg:relative lg:border lg:rounded-lg lg:bg-card">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-center gap-2 h-11 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <CheckCircle2 className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-600">{t('rsvp.committedToMatch')}</span>
          </div>
        </div>
      </div>
    );
  }

  if (isDeadlinePassed && !userStatus) {
    return (
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-background/95 backdrop-blur border-t p-3 lg:bottom-0 lg:relative lg:border lg:rounded-lg lg:bg-card">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-center gap-2 h-11 bg-muted rounded-lg border">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">{t('rsvp.closed')}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 bg-background/95 backdrop-blur border-t p-3 lg:bottom-0 lg:relative lg:border lg:rounded-lg lg:bg-card">
      <div className="max-w-lg mx-auto">
        <div className="flex gap-2">
          <Button
            variant={userStatus === 'attending' ? "default" : "outline"}
            size="sm"
            className={cn(
              "flex-1 h-[52px] gap-1.5 text-sm font-semibold transition-all",
              userStatus === 'attending' && "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm animate-rsvp-pop",
              userStatus !== 'attending' && "bg-card border border-border text-muted-foreground"
            )}
            onClick={() => handleClick('attending')}
          >
            <CheckCircle2 className="h-4 w-4" />
            {t('rsvp.going')}
          </Button>
          <Button
            variant={userStatus === 'maybe' ? "default" : "outline"}
            size="sm"
            className={cn(
              "flex-1 h-[52px] gap-1.5 text-sm font-semibold transition-all",
              userStatus === 'maybe' && "bg-warning text-warning-foreground hover:bg-warning/90 shadow-sm animate-rsvp-pop",
              userStatus !== 'maybe' && "bg-card border border-border text-muted-foreground"
            )}
            onClick={() => handleClick('maybe')}
          >
            <HelpCircle className="h-4 w-4" />
            {t('rsvp.maybe')}
          </Button>
          <Button
            variant={userStatus === 'not_attending' ? "default" : "outline"}
            size="sm"
            className={cn(
              "flex-1 h-[52px] gap-1.5 text-sm font-semibold transition-all",
              userStatus === 'not_attending' && "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm animate-rsvp-pop",
              userStatus !== 'not_attending' && "bg-card border border-border text-muted-foreground"
            )}
            onClick={() => handleClick('not_attending')}
          >
            <XCircle className="h-4 w-4" />
            {t('rsvp.notGoing')}
          </Button>
        </div>
      </div>
    </div>
  );
};