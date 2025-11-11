import { PageContainer } from "@/components/mobile/PageContainer";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, TrendingUp, Target, History, Loader2 } from "lucide-react";
import { LogActivityDialog } from "@/components/track/LogActivityDialog";
import { ActivityCard } from "@/components/track/ActivityCard";
import { useActivities } from "@/hooks/useActivities";
import { useGoals } from "@/hooks/useGoals";
import { EmptyState } from "@/components/EmptyState";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const Track = () => {
  const { activities, loading: activitiesLoading, deleteActivity, getStats } = useActivities();
  const { goals, loading: goalsLoading } = useGoals();
  const stats = getStats();

  const activeGoals = goals.filter(g => g.status === 'active');

  if (activitiesLoading || goalsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-dark mb-3">
            <Activity className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Track Your Progress</h1>
          <p className="text-sm text-muted-foreground">Log activities, set goals, and monitor your journey</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <AnimatedCard delay={0.1}>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.totalActivities}</div>
              <div className="text-xs text-muted-foreground mt-1">Activities</div>
            </Card>
          </AnimatedCard>
          <AnimatedCard delay={0.15}>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.totalDistance.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground mt-1">Total km</div>
            </Card>
          </AnimatedCard>
          <AnimatedCard delay={0.2}>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{Math.floor(stats.totalDuration / 60)}h</div>
              <div className="text-xs text-muted-foreground mt-1">Total time</div>
            </Card>
          </AnimatedCard>
          <AnimatedCard delay={0.25}>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.totalCalories}</div>
              <div className="text-xs text-muted-foreground mt-1">Calories</div>
            </Card>
          </AnimatedCard>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="log" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="log">
              <Activity className="h-4 w-4 mr-2" />
              Log
            </TabsTrigger>
            <TabsTrigger value="goals">
              <Target className="h-4 w-4 mr-2" />
              Goals
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Log Activity Tab */}
          <TabsContent value="log" className="space-y-4 mt-6">
            <LogActivityDialog />
            
            {activeGoals.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <h3 className="font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Active Goals
                </h3>
                {activeGoals.map((goal, index) => (
                  <AnimatedCard key={goal.id} delay={0.1 + index * 0.05}>
                    <Card className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{goal.title}</h4>
                          <Badge variant="outline">{goal.goal_type}</Badge>
                        </div>
                        {goal.target_value && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">
                                {goal.current_value} / {goal.target_value} {goal.unit}
                              </span>
                            </div>
                            <Progress 
                              value={(goal.current_value / goal.target_value) * 100} 
                              className="h-2"
                            />
                          </div>
                        )}
                      </div>
                    </Card>
                  </AnimatedCard>
                ))}
              </motion.div>
            )}
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-4 mt-6">
            <Card className="p-6 text-center">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-semibold mb-2">Goal Management Coming Soon</h3>
              <p className="text-sm text-muted-foreground">
                Set personal fitness goals, track your progress, and celebrate achievements
              </p>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4 mt-6">
            {activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map((activity, index) => (
                  <AnimatedCard key={activity.id} delay={index * 0.05}>
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
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
};

export default Track;
