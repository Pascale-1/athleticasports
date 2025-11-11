import { PageContainer } from "@/components/mobile/PageContainer";
import { ActivityCard } from "@/components/track/ActivityCard";
import { useActivities } from "@/hooks/useActivities";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FAB } from "@/components/mobile/FAB";
import { LogActivityDialog } from "@/components/track/LogActivityDialog";
import { useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { History } from "lucide-react";

const ActivityHistory = () => {
  const navigate = useNavigate();
  const { activities, loading, deleteActivity } = useActivities();
  const [logActivityOpen, setLogActivityOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-4 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/track')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Activity History</h1>
            <p className="text-sm text-muted-foreground">
              {activities.length} total {activities.length === 1 ? 'activity' : 'activities'}
            </p>
          </div>
        </div>

        {/* Activities List */}
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
      </div>

      <FAB
        icon={<Plus className="h-5 w-5" />}
        label="Log Activity"
        onClick={() => setLogActivityOpen(true)}
      />

      {logActivityOpen && (
        <LogActivityDialog 
          onClose={() => setLogActivityOpen(false)}
        />
      )}
    </PageContainer>
  );
};

export default ActivityHistory;
