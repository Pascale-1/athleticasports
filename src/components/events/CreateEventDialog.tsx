import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UnifiedEventForm } from "./UnifiedEventForm";
import { CreateEventData, useEvents } from "@/hooks/useEvents";
import { EventType } from "@/lib/eventConfig";

const SPORT_EMOJIS: Record<string, string> = {
  football: "⚽",
  basketball: "🏀",
  tennis: "🎾",
  volleyball: "🏐",
  rugby: "🏉",
  handball: "🤾",
  badminton: "🏸",
  padel: "🎾",
  running: "🏃",
  cycling: "🚴",
  swimming: "🏊",
};

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
  const { t, i18n } = useTranslation('events');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeType, setActiveType] = useState<EventType>(defaultType);
  const [lastSport, setLastSport] = useState<string | undefined>(sport);
  const { createEvent: internalCreateEvent } = useEvents(teamId);

  const handleSubmit = async (data: CreateEventData) => {
    setIsSubmitting(true);
    const createFn = parentCreateEvent ?? internalCreateEvent;
    const success = await createFn(data);
    setIsSubmitting(false);
    
    if (success) {
      setLastSport(data.sport || sport);
      onCreated?.();
      setShowSuccess(true);
    }
    
    return success;
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleClose = () => {
    setShowSuccess(false);
    onOpenChange(false);
  };

  const handleCreateAnother = () => {
    setShowSuccess(false);
  };

  const sportEmoji = SPORT_EMOJIS[lastSport || sport || ''] || '🎉';

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); else onOpenChange(o); }}>
      <DialogContent aria-describedby={undefined} className="max-w-md w-[calc(100%-2rem)] mx-auto max-h-[90vh] flex flex-col overflow-hidden pb-0 pt-0 px-0 rounded-2xl border-border/50 bg-background">
        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-scale-in">
            <span className="text-5xl mb-4">{sportEmoji}</span>
            <h2 className="text-[24px] font-bold mb-2">
              {t('create.successTitle')} 🎉
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {t('create.successDesc')}
            </p>
            <div className="flex flex-col gap-2 w-full">
              <Button onClick={handleClose}>
                {t('create.close')}
              </Button>
              <Button variant="ghost" onClick={handleCreateAnother}>
                {t('create.createAnother')}
              </Button>
            </div>
          </div>
        ) : (
          <UnifiedEventForm
            teamId={teamId}
            sport={sport}
            defaultType={defaultType}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            onTypeChange={setActiveType}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
