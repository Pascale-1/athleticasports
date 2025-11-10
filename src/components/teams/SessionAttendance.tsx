import { Check, X, HelpCircle, Users, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useSessionAttendance } from "@/hooks/useSessionAttendance";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SessionAttendanceProps {
  sessionId: string;
  totalMembers: number;
  canViewDetails: boolean;
  currentUserId?: string;
  isPastSession?: boolean;
}

export const SessionAttendance = ({
  sessionId,
  totalMembers,
  canViewDetails,
  currentUserId,
  isPastSession = false,
}: SessionAttendanceProps) => {
  const { attendance, stats, userStatus, loading, setAttendance } = useSessionAttendance(
    sessionId,
    totalMembers
  );
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const getAttendanceByStatus = (status: string) => {
    return attendance.filter((a) => a.status === status);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Attendance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            <Check className="h-3 w-3 mr-1" />
            {stats.attending} Attending
          </Badge>
          <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-white">
            <HelpCircle className="h-3 w-3 mr-1" />
            {stats.maybe} Maybe
          </Badge>
          <Badge variant="destructive">
            <X className="h-3 w-3 mr-1" />
            {stats.not_attending} Not Attending
          </Badge>
          <Badge variant="outline">
            <Users className="h-3 w-3 mr-1" />
            {stats.not_responded} No Response
          </Badge>
        </div>

        {/* User Response Buttons */}
        {!isPastSession && (
          <div className="flex gap-2">
            <Button
              variant={userStatus === "attending" ? "default" : "outline"}
              size="sm"
              onClick={() => setAttendance("attending")}
              className={cn(
                userStatus === "attending" && "bg-green-500 hover:bg-green-600"
              )}
            >
              <Check className="h-4 w-4 mr-1" />
              Attending
            </Button>
            <Button
              variant={userStatus === "maybe" ? "default" : "outline"}
              size="sm"
              onClick={() => setAttendance("maybe")}
              className={cn(
                userStatus === "maybe" && "bg-yellow-500 hover:bg-yellow-600"
              )}
            >
              <HelpCircle className="h-4 w-4 mr-1" />
              Maybe
            </Button>
            <Button
              variant={userStatus === "not_attending" ? "destructive" : "outline"}
              size="sm"
              onClick={() => setAttendance("not_attending")}
            >
              <X className="h-4 w-4 mr-1" />
              Not Attending
            </Button>
          </div>
        )}

        {/* Detailed Lists for Coaches/Admins */}
        {canViewDetails && (
          <div className="space-y-2 pt-4 border-t">
            {/* Attending List */}
            <Collapsible
              open={expandedSection === "attending"}
              onOpenChange={() => toggleSection("attending")}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-md hover:bg-muted">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Attending ({stats.attending})</span>
                </div>
                {expandedSection === "attending" ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 space-y-2">
                {getAttendanceByStatus("attending").map((item) => (
                  <div key={item.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={item.profile?.avatar_url || undefined} />
                      <AvatarFallback>
                        {(item.profile?.display_name || item.profile?.username || "U")[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">
                      {item.profile?.display_name || item.profile?.username}
                    </span>
                  </div>
                ))}
                {stats.attending === 0 && (
                  <p className="text-sm text-muted-foreground">No one attending yet</p>
                )}
              </CollapsibleContent>
            </Collapsible>

            {/* Maybe List */}
            <Collapsible
              open={expandedSection === "maybe"}
              onOpenChange={() => toggleSection("maybe")}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-md hover:bg-muted">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">Maybe ({stats.maybe})</span>
                </div>
                {expandedSection === "maybe" ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 space-y-2">
                {getAttendanceByStatus("maybe").map((item) => (
                  <div key={item.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={item.profile?.avatar_url || undefined} />
                      <AvatarFallback>
                        {(item.profile?.display_name || item.profile?.username || "U")[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">
                      {item.profile?.display_name || item.profile?.username}
                    </span>
                  </div>
                ))}
                {stats.maybe === 0 && (
                  <p className="text-sm text-muted-foreground">No one marked as maybe</p>
                )}
              </CollapsibleContent>
            </Collapsible>

            {/* Not Attending List */}
            <Collapsible
              open={expandedSection === "not_attending"}
              onOpenChange={() => toggleSection("not_attending")}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-md hover:bg-muted">
                <div className="flex items-center gap-2">
                  <X className="h-4 w-4 text-destructive" />
                  <span className="font-medium">Not Attending ({stats.not_attending})</span>
                </div>
                {expandedSection === "not_attending" ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 space-y-2">
                {getAttendanceByStatus("not_attending").map((item) => (
                  <div key={item.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={item.profile?.avatar_url || undefined} />
                      <AvatarFallback>
                        {(item.profile?.display_name || item.profile?.username || "U")[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">
                      {item.profile?.display_name || item.profile?.username}
                    </span>
                  </div>
                ))}
                {stats.not_attending === 0 && (
                  <p className="text-sm text-muted-foreground">Everyone is attending</p>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
