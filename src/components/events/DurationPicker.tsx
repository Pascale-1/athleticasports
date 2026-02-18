import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DurationPickerProps {
  value: number; // duration in minutes
  onChange: (minutes: number) => void;
  label?: string;
  presets?: number[]; // array of minutes
  className?: string;
}

const DEFAULT_PRESETS = [60, 90, 120];

export const DurationPicker = ({
  value,
  onChange,
  presets = DEFAULT_PRESETS,
  className,
}: DurationPickerProps) => {
  const { t } = useTranslation('events');
  const [isCustom, setIsCustom] = useState(!presets.includes(value));
  const [customHours, setCustomHours] = useState(Math.floor(value / 60));
  const [customMinutes, setCustomMinutes] = useState(value % 60);

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (m === 0) return `${h}h`;
    if (h === 0) return `${m}min`;
    return `${h}h${m.toString().padStart(2, '0')}`;
  };

  const handlePresetClick = (minutes: number) => {
    setIsCustom(false);
    onChange(minutes);
  };

  const handleCustomChange = (hours: number, mins: number) => {
    const safeHours = Math.max(0, Math.min(12, hours));
    const safeMins = Math.max(0, Math.min(59, mins));
    setCustomHours(safeHours);
    setCustomMinutes(safeMins);
    onChange(safeHours * 60 + safeMins);
  };

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {presets.map((preset) => (
        <button
          key={preset}
          type="button"
          onClick={() => handlePresetClick(preset)}
          className={cn(
            "px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-150",
            !isCustom && value === preset
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "bg-transparent border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
          )}
        >
          {formatDuration(preset)}
        </button>
      ))}

      <button
        type="button"
        onClick={() => setIsCustom(true)}
        className={cn(
          "px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-150",
          isCustom
            ? "bg-primary text-primary-foreground border-primary shadow-sm"
            : "bg-transparent border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
        )}
      >
        {isCustom ? formatDuration(value) : t('form.durationCustom')}
      </button>

      {isCustom && (
        <div className="flex items-center gap-1.5 w-full mt-1">
          <div className="flex items-center gap-1">
            <Input
              type="number"
              min="0"
              max="12"
              value={customHours}
              onChange={(e) => handleCustomChange(parseInt(e.target.value) || 0, customMinutes)}
              className="w-14 h-7 text-center text-xs"
            />
            <span className="text-xs text-muted-foreground">h</span>
          </div>
          <div className="flex items-center gap-1">
            <Input
              type="number"
              min="0"
              max="59"
              step="15"
              value={customMinutes}
              onChange={(e) => handleCustomChange(customHours, parseInt(e.target.value) || 0)}
              className="w-14 h-7 text-center text-xs"
            />
            <span className="text-xs text-muted-foreground">min</span>
          </div>
        </div>
      )}
    </div>
  );
};
