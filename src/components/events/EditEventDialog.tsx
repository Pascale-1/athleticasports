import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Globe, Lock, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CreateEventData } from "@/hooks/useEvents";
import { Event } from "@/lib/events";
import { format } from "date-fns";

interface EditEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event;
  onUpdate: (eventId: string, data: Partial<CreateEventData>) => Promise<boolean>;
}

export const EditEventDialog = ({ 
  open, 
  onOpenChange, 
  event,
  onUpdate
}: EditEventDialogProps) => {
  const { t } = useTranslation('events');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMaxParticipants, setShowMaxParticipants] = useState(!!event.max_participants);
  
  // Form state
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description || '');
  const [location, setLocation] = useState(event.location || '');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(event.max_participants?.toString() || '');
  const [isPublic, setIsPublic] = useState(event.is_public);
  
  // Match-specific fields
  const [opponentName, setOpponentName] = useState(event.opponent_name || '');
  const [homeAway, setHomeAway] = useState<'home' | 'away' | 'neutral'>(event.home_away || 'home');
  const [matchFormat, setMatchFormat] = useState(event.match_format || '');

  // Initialize form with event data
  useEffect(() => {
    if (event && open) {
      setTitle(event.title);
      setDescription(event.description || '');
      setLocation(event.location || '');
      setMaxParticipants(event.max_participants?.toString() || '');
      setShowMaxParticipants(!!event.max_participants);
      setIsPublic(event.is_public);
      setOpponentName(event.opponent_name || '');
      setHomeAway(event.home_away || 'home');
      setMatchFormat(event.match_format || '');
      
      // Parse dates
      const start = new Date(event.start_time);
      const end = new Date(event.end_time);
      setStartDate(format(start, 'yyyy-MM-dd'));
      setStartTime(format(start, 'HH:mm'));
      setEndTime(format(end, 'HH:mm'));
    }
  }, [event, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${startDate}T${endTime}`);

    const data: Partial<CreateEventData> = {
      title,
      description: description || undefined,
      location: location || undefined,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      max_participants: maxParticipants ? parseInt(maxParticipants) : undefined,
      is_public: isPublic,
    };

    // Add match-specific fields
    if (event.type === 'match') {
      data.opponent_name = opponentName || undefined;
      data.home_away = homeAway;
      data.match_format = matchFormat || undefined;
    }

    const success = await onUpdate(event.id, data);
    setIsSubmitting(false);
    
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-2">
          <DialogTitle>{t('edit.title')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 min-w-0 overflow-hidden">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">{t('form.title')}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('form.titlePlaceholder')}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t('form.description')}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('form.descriptionPlaceholder')}
              rows={3}
            />
          </div>

          {/* Date & Time - Improved responsive layout */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="date">{t('form.date')}</Label>
              <Input
                id="date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="startTime">{t('form.startTime')}</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">{t('form.endTime')}</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">{t('form.location')}</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t('form.locationPlaceholder')}
            />
          </div>

          {/* Max Participants - Progressive disclosure */}
          {!showMaxParticipants ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => setShowMaxParticipants(true)}
            >
              <Users className="h-4 w-4 mr-2" />
              {t('form.maxParticipants')}
            </Button>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="maxParticipants">{t('form.maxParticipants')}</Label>
              <Input
                id="maxParticipants"
                type="number"
                min="1"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
              />
            </div>
          )}

          {/* Match-specific fields */}
          {event.type === 'match' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="opponent">{t('game.opponent')}</Label>
                <Input
                  id="opponent"
                  value={opponentName}
                  onChange={(e) => setOpponentName(e.target.value)}
                  placeholder={t('game.opponentPlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('game.homeAway')}</Label>
                <Select value={homeAway} onValueChange={(v) => setHomeAway(v as 'home' | 'away' | 'neutral')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">{t('game.home')}</SelectItem>
                    <SelectItem value="away">{t('game.away')}</SelectItem>
                    <SelectItem value="neutral">{t('game.neutral')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="format">{t('game.format')}</Label>
                <Input
                  id="format"
                  value={matchFormat}
                  onChange={(e) => setMatchFormat(e.target.value)}
                  placeholder="e.g., 5v5, 11v11"
                />
              </div>
            </>
          )}

          {/* Public/Private Toggle - Dynamic */}
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border">
            <div className="flex items-center gap-2">
              {isPublic ? (
                <Globe className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium">
                  {isPublic ? t('form.isPublic') : t('form.isPrivate')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isPublic ? t('form.isPublicDesc') : t('form.isPrivateDesc')}
                </p>
              </div>
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common:actions.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t('common:actions.save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};