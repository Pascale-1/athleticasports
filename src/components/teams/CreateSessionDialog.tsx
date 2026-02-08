import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CreateSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateSession: (data: {
    type: 'training';
    title: string;
    description?: string;
    location?: string;
    start_time: string;
    end_time: string;
    team_id?: string;
  }) => void;
  defaultDate?: Date;
  teamId?: string;
}

export const CreateSessionDialog = ({
  open,
  onOpenChange,
  onCreateSession,
  defaultDate = new Date(),
  teamId,
}: CreateSessionDialogProps) => {
  const { t } = useTranslation('teams');
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    date: defaultDate.toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "11:00",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const startDateTime = `${formData.date}T${formData.startTime}:00`;
    const endDateTime = `${formData.date}T${formData.endTime}:00`;

    onCreateSession({
      type: 'training',
      title: formData.title,
      description: formData.description || undefined,
      location: formData.location || undefined,
      start_time: startDateTime,
      end_time: endDateTime,
      team_id: teamId,
    });

    setFormData({
      title: "",
      description: "",
      location: "",
      date: defaultDate.toISOString().split("T")[0],
      startTime: "09:00",
      endTime: "11:00",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-3 sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">{t('session.dialog.title')}</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {t('session.dialog.description')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t('session.dialog.titleField')} *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={t('session.dialog.titlePlaceholder')}
                required
                maxLength={200}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">{t('session.dialog.date')} *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">{t('session.dialog.startTime')} *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">{t('session.dialog.endTime')} *</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">{t('session.dialog.location')}</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder={t('session.dialog.locationPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('session.dialog.descriptionField')}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('session.dialog.descriptionPlaceholder')}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('session.dialog.cancel')}
            </Button>
            <Button type="submit">{t('session.dialog.create')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
