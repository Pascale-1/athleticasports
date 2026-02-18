import { useTranslation } from "react-i18next";
import { Dumbbell, Users, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { EventType } from "@/lib/eventConfig";

interface EventTypeSelectorProps {
  value: EventType;
  onChange: (type: EventType) => void;
}

const EVENT_TYPE_OPTIONS: { type: EventType; icon: typeof Trophy; colorClass: string; descKey: string }[] = [
  { type: 'training', icon: Dumbbell, colorClass: 'text-primary', descKey: 'create.trainingDesc' },
  { type: 'match', icon: Trophy, colorClass: 'text-amber-500', descKey: 'create.gameDesc' },
  { type: 'meetup', icon: Users, colorClass: 'text-green-500', descKey: 'create.meetupDesc' },
];

export const EventTypeSelector = ({ value, onChange }: EventTypeSelectorProps) => {
  const { t } = useTranslation('events');

  return (
    <div className="grid grid-cols-3 gap-2">
      {EVENT_TYPE_OPTIONS.map(({ type, icon: Icon, colorClass, descKey }) => {
        const isSelected = value === type;
        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            aria-pressed={isSelected}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-xl p-3 text-left transition-all duration-200 border",
              isSelected
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-muted/40 border-transparent hover:bg-muted/70 hover:border-border"
            )}
          >
            <Icon className={cn("h-5 w-5", isSelected ? "text-primary-foreground" : colorClass)} />
            <span className="text-xs font-semibold leading-tight">
              {t(`types.${type === 'match' ? 'game' : type}`)}
            </span>
            <span className={cn(
              "text-[10px] leading-tight text-center",
              isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
            )}>
              {t(descKey)}
            </span>
          </button>
        );
      })}
    </div>
  );
};
