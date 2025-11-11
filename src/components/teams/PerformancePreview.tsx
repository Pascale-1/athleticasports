import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface PerformancePreviewProps {
  teamId: string;
  memberCount: number;
}

export const PerformancePreview = ({ teamId, memberCount }: PerformancePreviewProps) => {
  const [levelDistribution, setLevelDistribution] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformanceLevels = async () => {
      try {
        const { data, error } = await supabase
          .from('player_performance_levels')
          .select('level')
          .eq('team_id', teamId);

        if (error) throw error;

        const distribution: Record<number, number> = {};
        data?.forEach((item) => {
          distribution[item.level] = (distribution[item.level] || 0) + 1;
        });

        setLevelDistribution(distribution);
      } catch (error) {
        console.error('Error fetching performance levels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceLevels();
  }, [teamId]);

  const assignedCount = Object.values(levelDistribution).reduce((a, b) => a + b, 0);
  const averageLevel = assignedCount > 0
    ? Object.entries(levelDistribution).reduce((sum, [level, count]) => sum + parseInt(level) * count, 0) / assignedCount
    : 0;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-20" />
          </div>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-body-large font-semibold">Performance Levels</h3>
          <Link to={`/teams/${teamId}?tab=performance`}>
            <Button variant="ghost" size="sm" className="text-primary">
              View all <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

        {assignedCount === 0 ? (
          <p className="text-caption text-muted-foreground text-center py-4">
            No performance levels assigned yet
          </p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-caption text-muted-foreground">Average Level</span>
              </div>
              <span className="text-2xl font-bold">{averageLevel.toFixed(1)}</span>
            </div>

            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((level) => {
                const count = levelDistribution[level] || 0;
                const percentage = assignedCount > 0 ? (count / assignedCount) * 100 : 0;

                return (
                  <div key={level} className="space-y-1">
                    <div className="flex items-center justify-between text-caption">
                      <span className="text-muted-foreground">Level {level}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-caption text-muted-foreground text-center pt-2">
              {assignedCount} of {memberCount} members assigned
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
