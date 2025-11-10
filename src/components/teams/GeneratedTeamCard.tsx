import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PerformanceLevelBadge } from "./PerformanceLevelBadge";
import { GeneratedTeam } from "@/hooks/useTeamGeneration";
import { Progress } from "@/components/ui/progress";

interface GeneratedTeamCardProps {
  team: GeneratedTeam;
  accentColor: string;
}

const accentColors = [
  "border-l-purple-500",
  "border-l-blue-500",
  "border-l-green-500",
  "border-l-orange-500",
  "border-l-pink-500",
  "border-l-cyan-500",
];

export const GeneratedTeamCard = ({ team, accentColor }: GeneratedTeamCardProps) => {
  const avgLevel = team.average_level || 0;
  const progressValue = ((4 - avgLevel) / 3) * 100; // Convert level to progress (1=100%, 4=0%)

  return (
    <Card className={`border-l-4 ${accentColor}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{team.team_name}</CardTitle>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Avg. Level</p>
            <p className="text-2xl font-bold">{avgLevel.toFixed(2)}</p>
          </div>
        </div>
        <Progress value={progressValue} className="h-2 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            {team.members.length} {team.members.length === 1 ? "Member" : "Members"}
          </p>
          {team.members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.profiles?.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {member.profiles?.display_name?.[0] || member.profiles?.username[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {member.profiles?.display_name || member.profiles?.username || "Unknown"}
                  </p>
                </div>
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
