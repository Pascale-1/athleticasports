import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, Sparkles } from "lucide-react";
import { InterestedPlayer } from "@/hooks/useEventInterestedPlayers";

interface InterestedPlayersCardProps {
  players: InterestedPlayer[];
  onInvite: (proposalId: string, playerId: string) => Promise<boolean>;
}

function getMatchLabel(score: number | null): { label: string; className: string } | null {
  if (!score) return null;
  if (score >= 85) return { label: "Perfect", className: "bg-success/10 text-success" };
  if (score >= 70) return { label: "Great", className: "bg-primary/10 text-primary" };
  if (score >= 50) return { label: "Good", className: "bg-accent/10 text-accent-foreground" };
  return null;
}

export const InterestedPlayersCard = ({ players, onInvite }: InterestedPlayersCardProps) => {
  const { t } = useTranslation('matching');

  if (players.length === 0) return null;

  return (
    <Card>
      <CardContent className="p-3 space-y-2">
        <h3 className="font-semibold text-[11px] uppercase tracking-[0.8px] text-hint flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          {t('interestedPlayers', 'Interested Players')}
          <Badge variant="secondary" className="text-[10px] ml-1">{players.length}</Badge>
        </h3>

        <div className="space-y-2">
          {players.map((player) => {
            const profile = Array.isArray(player.profile) ? player.profile[0] : player.profile;
            const name = profile?.display_name || profile?.username || "Unknown";
            const matchInfo = getMatchLabel(player.match_score);

            return (
              <div key={player.id} className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">{name[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{name}</p>
                  {matchInfo && (
                    <Badge variant="secondary" className={`text-[10px] ${matchInfo.className}`}>
                      {matchInfo.label}
                    </Badge>
                  )}
                </div>
                <Button
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => onInvite(player.id, player.player_user_id)}
                >
                  <UserPlus className="h-3 w-3" />
                  {t('actions.invite', 'Invite')}
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
