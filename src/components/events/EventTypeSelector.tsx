import { useTranslation } from "react-i18next";
import { Dumbbell, Users, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { EventType } from "@/lib/eventConfig";

interface EventTypeSelectorProps {
  value: EventType;
  onChange: (type: EventType) => void;
}

const EVENT_TYPE_OPTIONS: { type: EventType; icon: typeof Trophy }[] = [
  { type: 'training', icon: Dumbbell },
  { type: 'match', icon: Trophy },
  { type: 'meetup', icon: Users },
];

export const EventTypeSelector = ({ value, onChange }: EventTypeSelectorProps) => {
  const { t } = useTranslation('events');

  return (
    <div className="flex gap-1.5 p-1 rounded-2xl bg-muted/50">
      {EVENT_TYPE_OPTIONS.map(({ type, icon: Icon }) => {
        const isSelected = value === type;
        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            aria-pressed={isSelected}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 min-h-[44px] rounded-xl text-sm font-medium transition-all duration-200",
              isSelected
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Icon className="h-4 w-4" />
            {t(`types.${type === 'match' ? 'game' : type}`)}
          </button>
        );
      })}
    </div>
  );
};
