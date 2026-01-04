import { CheckCircle2, HelpCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
}

export const EventRSVPBar = ({
  userStatus,
  isCommitted,
  stats,
  onUpdateAttendance,
  onRemoveAttendance,
  loading = false,
}: EventRSVPBarProps) => {
  const handleClick = (status: 'attending' | 'maybe' | 'not_attending') => {
    if (userStatus === status) {
      onRemoveAttendance();
    } else {
      onUpdateAttendance(status);
    }
  };

  if (loading) {
    return (
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-background/95 backdrop-blur border-t p-3 lg:bottom-0 lg:relative lg:border lg:rounded-lg lg:bg-card">
        <div className="flex items-center justify-center h-11">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // Committed users can't change their status
  if (isCommitted) {
    return (
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-background/95 backdrop-blur border-t p-3 lg:bottom-0 lg:relative lg:border lg:rounded-lg lg:bg-card">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-center gap-2 h-11 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <CheckCircle2 className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-600">Committed to this match</span>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-2">
            {stats.attending} going · {stats.maybe} maybe
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 bg-background/95 backdrop-blur border-t p-3 lg:bottom-0 lg:relative lg:border lg:rounded-lg lg:bg-card">
      <div className="max-w-lg mx-auto space-y-2">
        {/* Toggle buttons */}
        <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex-1 h-10 gap-1.5 transition-all",
              userStatus === 'attending' && "bg-success text-success-foreground hover:bg-success/90 shadow-sm"
            )}
            onClick={() => handleClick('attending')}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span className="hidden xs:inline">Going</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex-1 h-10 gap-1.5 transition-all",
              userStatus === 'maybe' && "bg-warning text-warning-foreground hover:bg-warning/90 shadow-sm"
            )}
            onClick={() => handleClick('maybe')}
          >
            <HelpCircle className="h-4 w-4" />
            <span className="hidden xs:inline">Maybe</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex-1 h-10 gap-1.5 transition-all",
              userStatus === 'not_attending' && "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm"
            )}
            onClick={() => handleClick('not_attending')}
          >
            <XCircle className="h-4 w-4" />
            <span className="hidden xs:inline">Can't Go</span>
          </Button>
        </div>
        
        {/* Attendance summary */}
        <p className="text-xs text-center text-muted-foreground">
          {stats.attending} going · {stats.maybe} maybe
        </p>
      </div>
    </div>
  );
};
