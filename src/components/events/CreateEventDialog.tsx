import { useState } from "react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { UnifiedEventForm } from "./UnifiedEventForm";
import { CreateEventData, useEvents } from "@/hooks/useEvents";
import { EventType } from "@/lib/eventConfig";

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId?: string;
  sport?: string;
  defaultType?: EventType;
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
  const [activeType, setActiveType] = useState<EventType>(defaultType);
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
    
    return success;
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="max-w-md w-[calc(100%-2rem)] mx-auto max-h-[85vh] overflow-y-auto overflow-x-hidden pb-6 pt-0 px-0">
        <UnifiedEventForm
          teamId={teamId}
          sport={sport}
          defaultType={defaultType}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          onTypeChange={setActiveType}
        />
      </DialogContent>
    </Dialog>
  );
};
