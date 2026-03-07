import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

interface TeamQuickStatsProps {
  eventCount: number;
  activeMemberCount: number;
  record: { wins: number; losses: number; draws: number };
  loading?: boolean;
}

export const TeamQuickStats = ({ eventCount, activeMemberCount, record, loading }: TeamQuickStatsProps) => {
  const { t } = useTranslation('teams');

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4 text-center">
              <Skeleton className="h-8 w-8 mx-auto mb-2 rounded-full" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-3 w-3/4 mx-auto" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      <Card className="active:scale-[0.97] transition-transform duration-150">
        <CardContent className="p-3 text-center">
          <Calendar className="h-6 w-6 mx-auto mb-1.5 text-primary" />
          <p className="text-xl font-bold">{eventCount}</p>
          <p className="text-[11px] text-muted-foreground">{t('stats.events')}</p>
        </CardContent>
      </Card>
      <Card className="active:scale-[0.97] transition-transform duration-150">
        <CardContent className="p-3 text-center">
          <Users className="h-6 w-6 mx-auto mb-1.5 text-primary" />
          <p className="text-xl font-bold">{activeMemberCount}</p>
          <p className="text-[11px] text-muted-foreground">{t('stats.members')}</p>
        </CardContent>
      </Card>
      <Card className="active:scale-[0.97] transition-transform duration-150">
        <CardContent className="p-3 text-center">
          <Trophy className="h-6 w-6 mx-auto mb-1.5 text-primary" />
          <p className="text-lg font-bold">
            <span className="text-success">{record.wins}</span>
            <span className="text-muted-foreground">-</span>
            <span className="text-destructive">{record.losses}</span>
            <span className="text-muted-foreground">-</span>
            <span className="text-primary">{record.draws}</span>
          </p>
          <p className="text-[11px] text-muted-foreground">{t('stats.record', 'W-L-D')}</p>
        </CardContent>
      </Card>
    </div>
  );
};
