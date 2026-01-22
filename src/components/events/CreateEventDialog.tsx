import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UnifiedEventForm } from "./UnifiedEventForm";
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
    
    return success;
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[calc(100%-2rem)] mx-auto max-h-[85vh] overflow-y-auto overflow-x-hidden pb-6">
        <DialogHeader>
          <DialogTitle>{t('create.title')}</DialogTitle>
        </DialogHeader>

        <UnifiedEventForm
          teamId={teamId}
          sport={sport}
          defaultType={defaultType}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};
