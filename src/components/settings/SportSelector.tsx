import { cn } from "@/lib/utils";

interface Sport {
  id: string;
  label: string;
  emoji: string;
}

const SPORTS: Sport[] = [
  { id: "Basketball", label: "Basketball", emoji: "🏀" },
  { id: "Soccer", label: "Soccer", emoji: "⚽" },
  { id: "Volleyball", label: "Volleyball", emoji: "🏐" },
  { id: "Tennis", label: "Tennis", emoji: "🎾" },
  { id: "Swimming", label: "Swimming", emoji: "🏊" },
  { id: "Track & Field", label: "Track", emoji: "🏃" },
  { id: "Hockey", label: "Hockey", emoji: "🏒" },
  { id: "Baseball", label: "Baseball", emoji: "⚾" },
  { id: "Football", label: "Football", emoji: "🏈" },
];

interface SportSelectorProps {
  value: string;
  onChange: (sport: string) => void;
}

export const SportSelector = ({ value, onChange }: SportSelectorProps) => {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        {SPORTS.map((sport) => (
          <button
            key={sport.id}
            type="button"
            onClick={() => onChange(sport.id)}
            className={cn(
              "flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all min-h-[72px] hover:scale-105 active:scale-95",
              value === sport.id
                ? "border-primary bg-primary/10 text-primary shadow-sm"
                : "border-border bg-background hover:border-primary/30"
            )}
            aria-pressed={value === sport.id}
            aria-label={`Select ${sport.label}`}
          >
            <span className="text-2xl leading-none" role="img" aria-label={sport.label}>
              {sport.emoji}
            </span>
            <span className="text-caption font-medium leading-tight text-center">
              {sport.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
