import { useTranslation } from "react-i18next";
import { Dumbbell, Users, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { EventType } from "@/lib/eventConfig";

interface EventTypeSelectorProps {
  value: EventType;
  onChange: (type: EventType) => void;
}

const EVENT_TYPE_OPTIONS: { type: EventType; icon: typeof Trophy; colorClass: string }[] = [
  { type: 'match', icon: Trophy, colorClass: 'text-amber-500' },
  { type: 'training', icon: Dumbbell, colorClass: 'text-primary' },
  { type: 'meetup', icon: Users, colorClass: 'text-green-500' },
];

export const EventTypeSelector = ({ value, onChange }: EventTypeSelectorProps) => {
  const { t } = useTranslation('events');

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">
        {t('form.selectEventType')}
      </Label>
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-muted/40 rounded-xl">
        {EVENT_TYPE_OPTIONS.map(({ type, icon: Icon, colorClass }) => (
          <Button
            key={type}
            type="button"
            variant={value === type ? 'default' : 'ghost'}
            onClick={() => onChange(type)}
            className={cn(
              "flex flex-col items-center gap-1.5 h-16 rounded-lg transition-all duration-200",
              value === type 
                ? "shadow-sm" 
                : "hover:bg-muted/60",
              value !== type && colorClass
            )}
            aria-pressed={value === type}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs font-medium">{t(`types.${type === 'match' ? 'game' : type}`)}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};
