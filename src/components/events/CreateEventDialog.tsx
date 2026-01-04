import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dumbbell, Users, Trophy } from "lucide-react";
import { TrainingEventForm } from "./TrainingEventForm";
import { MeetupEventForm } from "./MeetupEventForm";
import { MatchEventForm } from "./MatchEventForm";
import { CreateEventData, useEvents } from "@/hooks/useEvents";

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId?: string;
  sport?: string;
  defaultType?: 'training' | 'meetup' | 'match';
  createEvent?: (data: CreateEventData) => Promise<boolean>;
  onCreated?: () => void;
}

export const CreateEventDialog = ({ 
  open, 
  onOpenChange, 
  teamId,
  sport,
  defaultType = 'training',
  createEvent: parentCreateEvent,
  onCreated
}: CreateEventDialogProps) => {
  const [activeTab, setActiveTab] = useState<string>(defaultType);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createEvent: internalCreateEvent } = useEvents(teamId);
  const { t } = useTranslation('events');

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
      <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('create.title')}</DialogTitle>
        </DialogHeader>

        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold">{t('create.chooseType')}</h3>
          <p className="text-sm text-muted-foreground mt-1">{t('create.selectTypeDesc')}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1">
            <TabsTrigger value="training" className="flex flex-col items-center gap-1 py-3">
              <Dumbbell className="h-5 w-5" />
              <span className="text-xs font-medium">{t('types.training')}</span>
              <span className="text-[10px] text-muted-foreground">{t('create.trainingDesc')}</span>
            </TabsTrigger>
            <TabsTrigger value="meetup" className="flex flex-col items-center gap-1 py-3">
              <Users className="h-5 w-5" />
              <span className="text-xs font-medium">{t('types.meetup')}</span>
              <span className="text-[10px] text-muted-foreground">{t('create.meetupDesc')}</span>
            </TabsTrigger>
            <TabsTrigger value="match" className="flex flex-col items-center gap-1 py-3">
              <Trophy className="h-5 w-5" />
              <span className="text-xs font-medium">{t('types.game')}</span>
              <span className="text-[10px] text-muted-foreground">{t('create.gameDesc')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="training" className="mt-6">
            <TrainingEventForm
              teamId={teamId}
              sport={sport}
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
              sport={sport}
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