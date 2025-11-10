import { PageContainer } from "@/components/mobile/PageContainer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, CircleDot, Bike, Dumbbell, Users, Calendar } from "lucide-react";

const activityTypes = [
  { icon: CircleDot, label: "Run", color: "text-orange-500" },
  { icon: Bike, label: "Cycle", color: "text-blue-500" },
  { icon: Dumbbell, label: "Workout", color: "text-purple-500" },
  { icon: Users, label: "Team Training", color: "text-teal-500" },
];

const Track = () => {
  return (
    <PageContainer>
      <div className="space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-dark mb-3">
            <Activity className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Log Activity</h1>
          <p className="text-sm text-muted-foreground">Track your training and progress</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Select Activity Type</h2>
          <div className="grid grid-cols-2 gap-3">
            {activityTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Card
                  key={type.label}
                  className="p-6 text-center cursor-pointer hover-lift transition-all active:scale-95"
                >
                  <Icon className={`h-10 w-10 mx-auto mb-3 ${type.color}`} />
                  <p className="font-semibold">{type.label}</p>
                </Card>
              );
            })}
          </div>
        </div>

        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Calendar className="h-5 w-5" />
            <span className="text-sm">Coming Soon</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Activity tracking is under development. Soon you'll be able to log your workouts, 
            track progress, and share achievements with your team.
          </p>
          <Button variant="outline" className="w-full">
            Learn More
          </Button>
        </Card>
      </div>
    </PageContainer>
  );
};

export default Track;
