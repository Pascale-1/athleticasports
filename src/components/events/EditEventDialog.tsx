import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Loader2, Globe, Lock, Users, Euro, CalendarIcon, MapPin,
  PenLine, AlignLeft, ChevronDown, Link2, type LucideIcon
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { CreateEventData } from "@/hooks/useEvents";
import { Event } from "@/lib/events";
import { format } from "date-fns";
import { AddressAutocomplete } from "@/components/location/AddressAutocomplete";
import { cn } from "@/lib/utils";

interface EditEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event;
  onUpdate: (eventId: string, data: Partial<CreateEventData>) => Promise<boolean>;
}

// FieldRow — icon-anchored row, defined outside component for stable identity
const FieldRow = ({
  icon: Icon,
  children,
  className,
  separator = true,
  iconAlign = 'top',
}: {
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
  separator?: boolean;
  iconAlign?: 'top' | 'center';
}) => (
  <div className={cn(
    "relative flex gap-3 py-3",
    separator && "border-b border-border",
    iconAlign === 'center' ? 'items-center' : 'items-start',
    className
  )}>
    <Icon className={cn("h-4 w-4 text-muted-foreground shrink-0", iconAlign === 'top' ? 'mt-0.5' : '')} />
    <div className="flex-1 min-w-0">{children}</div>
  </div>
);

export const EditEventDialog = ({
  open,
  onOpenChange,
  event,
  onUpdate
}: EditEventDialogProps) => {
  const { t } = useTranslation('events');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [dateExpanded, setDateExpanded] = useState(false);

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

  // Cost & Payment fields
  const [cost, setCost] = useState(event.cost || '');
  const [costType, setCostType] = useState<'total' | 'per_person'>((event.cost_type as 'total' | 'per_person') || 'total');
  const [hasCost, setHasCost] = useState(!!event.cost);
  const [paymentLink, setPaymentLink] = useState(event.payment_link || '');

  // Initialize form with event data
  useEffect(() => {
    if (open) {
      setTitle(event.title);
      setDescription(event.description || '');
      setLocation(event.location || '');
      setMaxParticipants(event.max_participants?.toString() || '');
      setIsPublic(event.is_public);
      setOpponentName(event.opponent_name || '');
      setHomeAway(event.home_away || 'home');

      setCost(event.cost || '');
      setCostType((event.cost_type as 'total' | 'per_person') || 'total');
      setHasCost(!!event.cost);
      setPaymentLink(event.payment_link || '');

      // Parse dates
      const start = new Date(event.start_time);
      const end = new Date(event.end_time);
      setStartDate(format(start, 'yyyy-MM-dd'));
      setStartTime(format(start, 'HH:mm'));
      setEndTime(format(end, 'HH:mm'));

      // Reset UI state
      setDateExpanded(false);
      setShowMoreOptions(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, event.id]);

  const formatDateRow = () => {
    if (!startDate) return t('form.pickDate');
    const dateObj = new Date(`${startDate}T${startTime || '00:00'}`);
    return `${format(dateObj, 'EEE, MMM d')} · ${startTime || '--:--'} → ${endTime || '--:--'}`;
  };

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
    }

    // Add cost & payment fields
    data.cost = hasCost ? (cost || undefined) : undefined;
    data.cost_type = hasCost ? costType : undefined;
    data.payment_link = hasCost && cost && parseFloat(cost) > 0 && paymentLink ? paymentLink : undefined;

    const success = await onUpdate(event.id, data);
    setIsSubmitting(false);

    if (success) {
      onOpenChange(false);
    }
  };

  const hasMoreOptions = event.type === 'match' || true; // always show for max participants

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto p-4 sm:p-5">
        <DialogHeader className="pb-1">
          <DialogTitle>{t('edit.title')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="min-w-0 overflow-x-hidden">
          <div className="divide-y divide-border">

            {/* 1 — Title */}
            <FieldRow icon={PenLine} separator={false}>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent border-0 outline-none text-sm font-medium placeholder:text-muted-foreground/50 text-foreground"
                placeholder={t('form.titlePlaceholder')}
                required
              />
            </FieldRow>

            {/* 2 — Description */}
            <FieldRow icon={AlignLeft} separator={false}>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-transparent border-0 outline-none text-sm placeholder:text-muted-foreground/50 text-foreground resize-none leading-snug"
                placeholder={t('form.descriptionPlaceholder')}
              />
            </FieldRow>

            {/* 3 — Date & Time */}
            <FieldRow icon={CalendarIcon} separator={false}>
              <button
                type="button"
                className="text-sm text-foreground hover:text-primary transition-colors text-left w-full"
                onClick={() => setDateExpanded((v) => !v)}
              >
                <span className={cn(!startDate && "text-muted-foreground/70")}>
                  {formatDateRow()}
                </span>
              </button>

              {/* Expanded date/time pickers */}
              <AnimatePresence initial={false}>
                {(dateExpanded || !startDate) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 space-y-2">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                        className="w-full h-9 rounded-lg border border-border bg-muted/30 px-3 text-sm outline-none focus:border-primary transition-colors"
                      />
                      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-1.5">
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          required
                          className="bg-transparent border-0 outline-none text-sm text-foreground"
                        />
                        <span className="text-muted-foreground text-xs">→</span>
                        <input
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          required
                          className="bg-transparent border-0 outline-none text-sm text-foreground"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </FieldRow>

            {/* 4 — Location */}
            <FieldRow icon={MapPin} separator={false}>
              <AddressAutocomplete
                value={location}
                onChange={(val) => setLocation(val)}
                placeholder={t('form.locationPlaceholder')}
              />
            </FieldRow>

            {/* 5 — Visibility */}
            <FieldRow icon={isPublic ? Globe : Lock} separator={false} iconAlign="center">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {isPublic ? t('form.isPublic') : t('form.isPrivate')}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {isPublic ? t('form.isPublicDesc') : t('form.isPrivateDesc')}
                  </p>
                </div>
                <Switch checked={isPublic} onCheckedChange={setIsPublic} />
              </div>
            </FieldRow>

            {/* 6 — Cost */}
            <FieldRow icon={Euro} separator={false} iconAlign="center">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  {hasCost
                    ? (cost ? `€${cost} ${costType === 'per_person' ? t('cost.perPerson') : t('cost.total')}` : t('cost.label'))
                    : t('cost.freeToggle')}
                </p>
                <Switch
                  checked={hasCost}
                  onCheckedChange={(checked) => {
                    setHasCost(checked);
                    if (!checked) { setCost(''); setPaymentLink(''); }
                  }}
                />
              </div>

              <AnimatePresence initial={false}>
                {hasCost && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">€</span>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={cost}
                            onChange={(e) => setCost(e.target.value)}
                            placeholder={t('cost.placeholder')}
                            className="h-9 text-xs pl-7"
                          />
                        </div>
                        <div className="flex rounded-md border overflow-hidden shrink-0">
                          {(['total', 'per_person'] as const).map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setCostType(type)}
                              className={cn(
                                "px-2.5 py-1 text-xs transition-colors",
                                type === 'per_person' && "border-l",
                                costType === type ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
                              )}
                            >
                              {type === 'total' ? t('cost.total') : t('cost.perPerson')}
                            </button>
                          ))}
                        </div>
                      </div>
                      {cost && parseFloat(cost) > 0 && (
                        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-1.5">
                          <Link2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <input
                            value={paymentLink}
                            onChange={(e) => setPaymentLink(e.target.value)}
                            placeholder={t('cost.paymentLinkPlaceholder')}
                            className="flex-1 bg-transparent border-0 outline-none text-xs placeholder:text-muted-foreground/50 text-foreground"
                            type="url"
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </FieldRow>

            {/* 7 — More options */}
            {hasMoreOptions && (
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => setShowMoreOptions(!showMoreOptions)}
                  className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors flex items-center gap-1"
                >
                  {t('form.moreOptions')}
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", showMoreOptions && "rotate-180")} />
                </button>

                <AnimatePresence initial={false}>
                  {showMoreOptions && (
                    <motion.div
                      key="more-options"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="divide-y divide-border mt-2 border-t border-border">

                        {/* Max participants */}
                        <div className="flex items-center justify-between py-2.5 pl-7">
                          <Label className="text-sm flex items-center gap-2 text-foreground">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {t('form.maxParticipants')}
                          </Label>
                          <Input
                            type="number"
                            min="1"
                            value={maxParticipants}
                            onChange={(e) => setMaxParticipants(e.target.value)}
                            placeholder="--"
                            className="w-20 h-9 text-xs text-right"
                          />
                        </div>

                        {/* Match-specific fields */}
                        {event.type === 'match' && (
                          <>
                            <div className="py-2.5 pl-7">
                              <Label className="text-xs text-muted-foreground block mb-1.5">{t('game.opponent')}</Label>
                              <input
                                value={opponentName}
                                onChange={(e) => setOpponentName(e.target.value)}
                                placeholder={t('game.opponentPlaceholder')}
                                className="w-full bg-transparent border-0 outline-none text-sm placeholder:text-muted-foreground/50 text-foreground"
                              />
                            </div>

                            <div className="flex items-center justify-between py-2.5 pl-7">
                              <Label className="text-sm text-foreground">{t('game.homeAway')}</Label>
                              <Select value={homeAway} onValueChange={(v) => setHomeAway(v as 'home' | 'away' | 'neutral')}>
                                <SelectTrigger className="w-28 h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="home">{t('game.home')}</SelectItem>
                                  <SelectItem value="away">{t('game.away')}</SelectItem>
                                  <SelectItem value="neutral">{t('game.neutral')}</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

          </div>

          {/* Submit */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('common:actions.saving', 'Saving...')}
                </>
              ) : (
                t('common:actions.save')
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
