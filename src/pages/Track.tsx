import { PageContainer } from "@/components/mobile/PageContainer";
import { Card } from "@/components/ui/card";
import { Dumbbell, Flame, TrendingUp, Activity, Target, Calendar, Users, Clock, History, Loader2, ChevronRight } from "lucide-react";
import { LogActivityDialog } from "@/components/track/LogActivityDialog";
import { ActivityCard } from "@/components/track/ActivityCard";
import { useActivities } from "@/hooks/useActivities";
import { useGoals } from "@/hooks/useGoals";
import { useTeamActivityFeed } from "@/hooks/useTeamActivityFeed";
import { EmptyState } from "@/components/EmptyState";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const Track = () => {
  const navigate = useNavigate();
  const { activities, loading: activitiesLoading, deleteActivity, getStats } = useActivities();
  const { goals, loading: goalsLoading } = useGoals();
  const { activities: teamActivities, loading: teamActivitiesLoading } = useTeamActivityFeed();
  const stats = getStats();
  const [goalsOpen, setGoalsOpen] = useState(true);

  const activeGoals = goals.filter(g => g.status === 'active');
  const recentActivities = activities.slice(0, 5);

  // Calculate streak
  const streak = useMemo(() => {
    if (activities.length === 0) return 0;
    
    const sortedActivities = [...activities].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    let currentStreak = 0;
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);
    
    for (const activity of sortedActivities) {
      const activityDate = new Date(activity.date);
      activityDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor(
        (checkDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (diffDays === 0 || diffDays === 1) {
        currentStreak++;
        checkDate = activityDate;
      } else if (diffDays > 1) {
        break;
      }
    }
    
    return currentStreak;
  }, [activities]);

  if (activitiesLoading || goalsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-4 animate-fade-in">
        {/* Streak Card - Conditional */}
        {streak > 0 && (
          <AnimatedCard delay={0.05}>
            <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Flame className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{streak} Day{streak !== 1 ? 's' : ''}</div>
                    <div className="text-sm text-muted-foreground">Current Streak 🔥</div>
                  </div>
                </div>
              </div>
            </Card>
          </AnimatedCard>
        )}

        {/* Log Activity - Primary CTA */}
        <AnimatedCard delay={0.1}>
          <LogActivityDialog />
        </AnimatedCard>

        {/* Stats Grid - Denser Layout */}
        <div className="grid grid-cols-4 gap-2">
          <AnimatedCard delay={0.15}>
            <Card className="p-3 text-center">
              <div className="text-display font-bold text-primary leading-none">{stats.totalActivities}</div>
              <div className="text-caption text-muted-foreground mt-1">Activities</div>
            </Card>
          </AnimatedCard>
          <AnimatedCard delay={0.2}>
            <Card className="p-3 text-center">
              <div className="text-display font-bold text-primary leading-none">{stats.totalDistance.toFixed(1)}</div>
              <div className="text-caption text-muted-foreground mt-1">km</div>
            </Card>
          </AnimatedCard>
          <AnimatedCard delay={0.25}>
            <Card className="p-3 text-center">
              <div className="text-display font-bold text-primary leading-none">{Math.floor(stats.totalDuration / 60)}h</div>
              <div className="text-caption text-muted-foreground mt-1">Duration</div>
            </Card>
          </AnimatedCard>
          <AnimatedCard delay={0.3}>
            <Card className="p-3 text-center">
              <div className="text-display font-bold text-primary leading-none">{Math.round(stats.totalCalories / 1000)}k</div>
              <div className="text-caption text-muted-foreground mt-1">Calories</div>
            </Card>
          </AnimatedCard>
        </div>

        {/* Active Goals - Collapsible */}
        {activeGoals.length > 0 && (
          <AnimatedCard delay={0.35}>
            <Collapsible open={goalsOpen} onOpenChange={setGoalsOpen}>
              <Card className="overflow-hidden">
                <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Active Goals ({activeGoals.length})
                  </h3>
                  <motion.div
                    animate={{ rotate: goalsOpen ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </motion.div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-3 p-4 pt-0">
                    {activeGoals.map((goal) => {
                      const percentage = goal.target_value 
                        ? Math.min((goal.current_value / goal.target_value) * 100, 100)
                        : 0;
                      
                      return (
                        <Card key={goal.id} className="p-3 bg-muted/30">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-medium text-body flex-1 min-w-0 truncate">{goal.title}</h4>
                              <Badge variant="outline" className="text-caption shrink-0">{goal.goal_type}</Badge>
                            </div>
                            {goal.target_value && (
                              <div className="space-y-2">
                                <Progress 
                                  value={percentage} 
                                  className="h-2"
                                />
                                <div className="flex items-center justify-between">
                                  <span className="text-body font-semibold text-primary">
                                    {Math.round(percentage)}%
                                  </span>
                                  <span className="text-caption text-muted-foreground">
                                    {goal.current_value} / {goal.target_value} {goal.unit}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </AnimatedCard>
        )}

        {/* Recent Activities */}
        <AnimatedCard delay={0.4}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                Recent Activities
              </h3>
              {activities.length > 5 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/activity-history')}
                  className="text-primary"
                >
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>

            {recentActivities.length > 0 ? (
              <div className="space-y-3">
                {recentActivities.map((activity, index) => (
                  <AnimatedCard key={activity.id} delay={0.45 + index * 0.05}>
                    <ActivityCard 
                      activity={activity} 
                      onDelete={deleteActivity}
                    />
                  </AnimatedCard>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={History}
                title="No activities yet"
                description="Start logging your workouts to track your progress"
                action={<LogActivityDialog />}
              />
            )}
          </div>
        </AnimatedCard>

        {/* Team Activity Feed */}
        {!teamActivitiesLoading && teamActivities.length > 0 && (
          <AnimatedCard delay={0.5}>
            <Card>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Team Activity Feed
                  </h3>
                </div>

                <div className="space-y-3">
                  {teamActivities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <img
                        src={activity.profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activity.profile.username}`}
                        alt={activity.profile.display_name || activity.profile.username}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-caption font-medium">
                          {activity.profile.display_name || activity.profile.username}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {activity.title} • {activity.type}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                          <Badge variant="outline" className="text-[10px] h-5">
                            {activity.team_name}
                          </Badge>
                          {activity.distance && (
                            <span className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              {activity.distance}km
                            </span>
                          )}
                          {activity.duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {Math.round(activity.duration / 60)}min
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {teamActivities.length > 5 && (
                  <p className="text-[11px] text-center text-muted-foreground">
                    +{teamActivities.length - 5} more activities from teammates
                  </p>
                )}
              </div>
            </Card>
          </AnimatedCard>
        )}
      </div>
    </PageContainer>
  );
};

export default Track;
