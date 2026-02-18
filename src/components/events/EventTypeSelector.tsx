import { useTranslation } from "react-i18next";
import { Dumbbell, Users, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { EventType } from "@/lib/eventConfig";

interface EventTypeSelectorProps {
  value: EventType;
  onChange: (type: EventType) => void;
}

const EVENT_TYPE_OPTIONS: { type: EventType; icon: typeof Trophy; colorClass: string }[] = [
  { type: 'training', icon: Dumbbell, colorClass: 'text-primary' },
  { type: 'match', icon: Trophy, colorClass: 'text-amber-500' },
  { type: 'meetup', icon: Users, colorClass: 'text-emerald-500' },
];

export const EventTypeSelector = ({ value, onChange }: EventTypeSelectorProps) => {
  const { t } = useTranslation('events');

  return (
    <div className="flex gap-2 pb-1 mb-1">
      {EVENT_TYPE_OPTIONS.map(({ type, icon: Icon, colorClass }) => {
        const isSelected = value === type;
        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            aria-pressed={isSelected}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border",
              isSelected
                ? "bg-primary/10 text-primary border-primary/40"
                : "bg-transparent border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
            )}
          >
            <Icon className={cn("h-3.5 w-3.5", isSelected ? "text-primary" : colorClass)} />
            {t(`types.${type === 'match' ? 'game' : type}`)}
          </button>
        );
      })}
    </div>
  );
};
