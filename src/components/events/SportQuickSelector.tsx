import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { getFeaturedSports, getRegularSports, getSportLabel, getActiveSports } from "@/lib/sports";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface SportQuickSelectorProps {
  value: string | null;
  onChange: (sportId: string) => void;
  label?: string;
  lang?: 'en' | 'fr';
  className?: string;
  required?: boolean;
}

const VISIBLE_COUNT = 6;

export const SportQuickSelector = ({
  value,
  onChange,
  lang = 'fr',
  className,
}: SportQuickSelectorProps) => {
  const [moreOpen, setMoreOpen] = useState(false);
  const allSports = getActiveSports();
  const visibleSports = allSports.slice(0, VISIBLE_COUNT);
  const moreSports = allSports.slice(VISIBLE_COUNT);

  const handleSelect = (id: string) => {
    onChange(id);
    setMoreOpen(false);
  };

  return (
    <div className={cn("flex flex-nowrap overflow-x-auto gap-1.5 pb-0.5 scrollbar-hide", className)}>
      {visibleSports.map((sport) => {
        const isSelected = value === sport.id;
        return (
          <button
            key={sport.id}
            type="button"
            onClick={() => handleSelect(sport.id)}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-150 shrink-0",
              isSelected
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-transparent border-border text-foreground hover:border-foreground/40 hover:bg-muted/50"
            )}
          >
            <span className="text-sm leading-none">{sport.emoji}</span>
            <span>{getSportLabel(sport.id, lang)}</span>
          </button>
        );
      })}

      {moreSports.length > 0 && (
        <Popover open={moreOpen} onOpenChange={setMoreOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex items-center gap-0.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-150 shrink-0",
                moreSports.some(s => s.id === value)
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-transparent border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
              )}
            >
              {moreSports.find(s => s.id === value)
                ? `${moreSports.find(s => s.id === value)!.emoji} ${getSportLabel(value!, lang)}`
                : `+${moreSports.length}`
              }
              <ChevronDown className="h-3 w-3 ml-0.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-52 p-2 bg-popover" align="start" onCloseAutoFocus={e => e.preventDefault()}>
            <div className="flex flex-wrap gap-1.5">
              {moreSports.map((sport) => {
                const isSelected = value === sport.id;
                return (
                  <button
                    key={sport.id}
                    type="button"
                    onClick={() => handleSelect(sport.id)}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border transition-all duration-150",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-transparent border-border text-foreground hover:border-foreground/40 hover:bg-muted/50"
                    )}
                  >
                    <span className="text-sm leading-none">{sport.emoji}</span>
                    <span>{getSportLabel(sport.id, lang)}</span>
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};
