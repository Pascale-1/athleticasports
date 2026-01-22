import { useTranslation } from "react-i18next";
import { Check, X, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { EventJoinRequest } from "@/hooks/useEventJoinRequests";

interface EventJoinRequestsProps {
  requests: EventJoinRequest[];
  onApprove: (requestId: string) => Promise<boolean>;
  onReject: (requestId: string) => Promise<boolean>;
  isLoading?: boolean;
}

export const EventJoinRequests = ({
  requests,
  onApprove,
  onReject,
  isLoading,
}: EventJoinRequestsProps) => {
  const { t } = useTranslation("events");

  const pendingRequests = requests.filter(r => r.status === "pending");

  if (pendingRequests.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          {t("joinRequests.title")}
          <Badge variant="secondary" className="ml-auto">
            {pendingRequests.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {pendingRequests.map((request) => (
          <div
            key={request.id}
            className="flex items-center justify-between p-3 rounded-lg border bg-card"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={request.profile?.avatar_url || undefined} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">
                  {request.profile?.display_name || request.profile?.username || "User"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                </p>
                {request.message && (
                  <p className="text-xs text-muted-foreground mt-1 italic">
                    "{request.message}"
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReject(request.id)}
                disabled={isLoading}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={() => onApprove(request.id)}
                disabled={isLoading}
                className="h-8 w-8 p-0"
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
