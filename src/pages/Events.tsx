import { PageContainer } from "@/components/mobile/PageContainer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";

const Events = () => {
  return (
    <PageContainer>
      <div className="space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-dark mb-3">
            <Calendar className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-sm text-muted-foreground">Discover and manage training, meetups, and matches</p>
        </div>

        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Calendar className="h-5 w-5" />
            <span className="text-sm">Events System</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The unified events system is under development. Soon you'll be able to create and manage 
            training sessions, social meetups, and competitive matches all in one place.
          </p>
          <Button variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Create Event (Coming Soon)
          </Button>
        </Card>
      </div>
    </PageContainer>
  );
};

export default Events;
