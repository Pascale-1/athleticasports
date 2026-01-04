import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Search, Swords, MapPin, Calendar, X, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { usePlayerAvailability } from "@/hooks/usePlayerAvailability";
import { useMatchProposals, MatchProposal } from "@/hooks/useMatchProposals";
import { MatchProposalCard } from "./MatchProposalCard";
import { useState } from "react";

interface MyMatchStatusProps {
  onFindMatchClick: () => void;
}

export const MyMatchStatus = ({ onFindMatchClick }: MyMatchStatusProps) => {
  const { availability, loading: availabilityLoading, cancelAvailability } = usePlayerAvailability();
  const { proposals, loading: proposalsLoading, acceptProposal, declineProposal } = useMatchProposals();
  const [cancelling, setCancelling] = useState(false);

  const loading = availabilityLoading || proposalsLoading;

  const handleCancelAvailability = async () => {
    setCancelling(true);
    try {
      await cancelAvailability();
    } finally {
      setCancelling(false);
    }
  };

  // Don't render if nothing to show
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Swords className="h-5 w-5 text-primary" />
            Match Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const hasContent = proposals.length > 0 || availability;

  if (!hasContent) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Swords className="h-5 w-5 text-primary" />
          Match Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pending Proposals */}
        {proposals.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                {proposals.length} match{proposals.length > 1 ? 'es' : ''} found!
              </span>
            </div>
            
            {proposals.map((proposal) => (
              <MatchProposalCard
                key={proposal.id}
                proposal={proposal}
                onAccept={acceptProposal}
                onDecline={declineProposal}
              />
            ))}
          </div>
        )}

        {/* Active Availability */}
        {availability && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Looking for matches</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelAvailability}
                disabled={cancelling}
                className="h-8 text-muted-foreground hover:text-destructive"
              >
                {cancelling ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <div className="p-3 rounded-lg bg-muted/50 space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="capitalize">
                  {availability.sport}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 inline mr-1" />
                  Until {format(new Date(availability.available_until), "MMM d")}
                </span>
              </div>
              
              {availability.location && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {availability.location}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CTA if no availability */}
        {!availability && proposals.length === 0 && (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={onFindMatchClick}
          >
            <Search className="h-4 w-4 mr-2" />
            Find a Match
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
