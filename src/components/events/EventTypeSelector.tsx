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
    <div className="flex border-b border-border">
      {EVENT_TYPE_OPTIONS.map(({ type, icon: Icon }) => {
        const isSelected = value === type;
        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            aria-pressed={isSelected}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm border-b-2 transition-all duration-200 -mb-px",
              isSelected
                ? "border-primary text-foreground font-semibold"
                : "border-transparent text-muted-foreground font-medium hover:text-foreground hover:border-border"
            )}
          >
            <Icon className={cn("h-3.5 w-3.5", isSelected ? "text-primary" : "text-muted-foreground")} />
            {t(`types.${type === 'match' ? 'game' : type}`)}
          </button>
        );
      })}
    </div>
  );
};
