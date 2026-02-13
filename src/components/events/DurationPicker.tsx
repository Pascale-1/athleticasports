import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface DurationPickerProps {
  value: number; // duration in minutes
  onChange: (minutes: number) => void;
  label?: string;
  presets?: number[]; // array of minutes
  className?: string;
}

const DEFAULT_PRESETS = [60, 90, 120]; // 1h, 1.5h, 2h

export const DurationPicker = ({
  value,
  onChange,
  label,
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

  const handleCustomClick = () => {
    setIsCustom(true);
  };

  const handleCustomChange = (hours: number, mins: number) => {
    const safeHours = Math.max(0, Math.min(12, hours));
    const safeMins = Math.max(0, Math.min(59, mins));
    setCustomHours(safeHours);
    setCustomMinutes(safeMins);
    onChange(safeHours * 60 + safeMins);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label className="text-sm font-medium">{label}</Label>}
      
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <Button
            key={preset}
            type="button"
            size="sm"
            variant={!isCustom && value === preset ? "default" : "outline"}
            onClick={() => handlePresetClick(preset)}
            className="min-w-[48px] text-xs"
          >
            {formatDuration(preset)}
          </Button>
        ))}
        
        <Button
          type="button"
          size="sm"
          variant={isCustom ? "default" : "outline"}
          onClick={handleCustomClick}
          className="min-w-[48px] text-xs"
        >
          {isCustom ? formatDuration(value) : t('form.durationCustom')}
        </Button>
      </div>

      {isCustom && (
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-1">
            <Input
              type="number"
              min="0"
              max="12"
              value={customHours}
              onChange={(e) => handleCustomChange(parseInt(e.target.value) || 0, customMinutes)}
              className="w-16 text-center"
            />
            <span className="text-sm text-muted-foreground">h</span>
          </div>
          <div className="flex items-center gap-1">
            <Input
              type="number"
              min="0"
              max="59"
              step="15"
              value={customMinutes}
              onChange={(e) => handleCustomChange(customHours, parseInt(e.target.value) || 0)}
              className="w-16 text-center"
            />
            <span className="text-sm text-muted-foreground">min</span>
          </div>
        </div>
      )}
    </div>
  );
};
