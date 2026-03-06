import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PerformanceLevelBadge } from "./PerformanceLevelBadge";
import { GeneratedTeam } from "@/hooks/useTeamGeneration";
import { Badge } from "@/components/ui/badge";

interface GeneratedTeamCardProps {
  team: GeneratedTeam;
  accentColor: string;
}

const accentColors = [
  "border-l-purple-500",
  "border-l-blue-500",
  "border-l-green-500",
  "border-l-primary",
  "border-l-pink-500",
  "border-l-cyan-500",
];

export const GeneratedTeamCard = ({ team, accentColor }: GeneratedTeamCardProps) => {
  const avgLevel = team.average_level || 0;

  return (
    <Card className={`border-l-4 ${accentColor}`}>
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">{team.team_name}</p>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {team.members.length} {team.members.length === 1 ? "player" : "players"}
            </Badge>
            {avgLevel > 0 && (
              <Badge variant="secondary" className="text-xs">
                Avg {avgLevel.toFixed(1)}
              </Badge>
            )}
          </div>
        </div>
        <div className="space-y-1">
          {team.members.map((member) => (
            <div key={member.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={member.profiles?.avatar_url || undefined} />
                  <AvatarFallback className="text-[10px]">
                    {member.profiles?.display_name?.[0] || member.profiles?.username[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">
                  {member.profiles?.display_name || member.profiles?.username || "Unknown"}
                </span>
              </div>
              <PerformanceLevelBadge level={member.performance_level} size="sm" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export { accentColors };
