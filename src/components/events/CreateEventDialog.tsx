import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Coffee, Swords } from "lucide-react";
import { TrainingEventForm } from "./TrainingEventForm";
import { MeetupEventForm } from "./MeetupEventForm";
import { MatchEventForm } from "./MatchEventForm";
import { CreateEventData, useEvents } from "@/hooks/useEvents";

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId?: string;
  defaultType?: 'training' | 'meetup' | 'match';
  createEvent?: (data: CreateEventData) => Promise<boolean>;
  onCreated?: () => void;
}

export const CreateEventDialog = ({ 
  open, 
  onOpenChange, 
  teamId,
  defaultType = 'training',
  createEvent: parentCreateEvent,
  onCreated
}: CreateEventDialogProps) => {
  const [activeTab, setActiveTab] = useState<string>(defaultType);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createEvent: internalCreateEvent } = useEvents(teamId);

  const handleSubmit = async (data: CreateEventData) => {
    setIsSubmitting(true);
    const createFn = parentCreateEvent ?? internalCreateEvent;
    const success = await createFn(data);
    setIsSubmitting(false);
    
    if (success) {
      onCreated?.();
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>

        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold">Choose Event Type</h3>
          <p className="text-sm text-muted-foreground mt-1">Select the type of event you want to create</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1">
            <TabsTrigger value="training" className="flex flex-col items-center gap-1 py-3">
              <Trophy className="h-5 w-5" />
              <span className="text-xs font-medium">Training</span>
              <span className="text-[10px] text-muted-foreground">Practice sessions</span>
            </TabsTrigger>
            <TabsTrigger value="meetup" className="flex flex-col items-center gap-1 py-3">
              <Coffee className="h-5 w-5" />
              <span className="text-xs font-medium">Meetup</span>
              <span className="text-[10px] text-muted-foreground">Social gatherings</span>
            </TabsTrigger>
            <TabsTrigger value="match" className="flex flex-col items-center gap-1 py-3">
              <Swords className="h-5 w-5" />
              <span className="text-xs font-medium">Match</span>
              <span className="text-[10px] text-muted-foreground">Competitive games</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="training" className="mt-6">
            <TrainingEventForm
              teamId={teamId}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
            />
          </TabsContent>

          <TabsContent value="meetup" className="mt-6">
            <MeetupEventForm
              teamId={teamId}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
            />
          </TabsContent>

          <TabsContent value="match" className="mt-6">
            <MatchEventForm
              teamId={teamId}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
