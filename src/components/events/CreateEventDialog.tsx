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
}

export const CreateEventDialog = ({ 
  open, 
  onOpenChange, 
  teamId,
  defaultType = 'training' 
}: CreateEventDialogProps) => {
  const [activeTab, setActiveTab] = useState<string>(defaultType);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createEvent } = useEvents(teamId);

  const handleSubmit = async (data: CreateEventData) => {
    setIsSubmitting(true);
    const success = await createEvent(data);
    setIsSubmitting(false);
    
    if (success) {
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="training" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Training</span>
            </TabsTrigger>
            <TabsTrigger value="meetup" className="flex items-center gap-2">
              <Coffee className="h-4 w-4" />
              <span className="hidden sm:inline">Meetup</span>
            </TabsTrigger>
            <TabsTrigger value="match" className="flex items-center gap-2">
              <Swords className="h-4 w-4" />
              <span className="hidden sm:inline">Match</span>
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
