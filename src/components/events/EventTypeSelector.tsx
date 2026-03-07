import { useTranslation } from "react-i18next";
import { Dumbbell, Users, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { EventType } from "@/lib/eventConfig";
import { motion, AnimatePresence } from "framer-motion";

interface EventTypeSelectorProps {
  value: EventType;
  onChange: (type: EventType) => void;
}

const EVENT_TYPE_OPTIONS: { type: EventType; icon: typeof Trophy; descKey: string }[] = [
  { type: 'training', icon: Dumbbell, descKey: 'create.trainingDesc' },
  { type: 'match', icon: Trophy, descKey: 'create.gameDesc' },
  { type: 'meetup', icon: Users, descKey: 'create.meetupDesc' },
];

export const EventTypeSelector = ({ value, onChange }: EventTypeSelectorProps) => {
  const { t } = useTranslation('events');
  const selected = EVENT_TYPE_OPTIONS.find(o => o.type === value);

  return (
    <div data-walkthrough="event-types">
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
      <AnimatePresence mode="wait">
        {selected && (
          <motion.p
            key={value}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="text-xs text-muted-foreground mt-1.5 px-1"
          >
            {t(selected.descKey)}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};
