import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { getFeaturedSports, getRegularSports, getSportLabel, Sport } from "@/lib/sports";
import { cn } from "@/lib/utils";

interface SportQuickSelectorProps {
  value: string | null;
  onChange: (sportId: string) => void;
  label?: string;
  lang?: 'en' | 'fr';
  className?: string;
  required?: boolean;
}

export const SportQuickSelector = ({
  value,
  onChange,
  label,
  lang = 'fr',
  className,
  required = false,
}: SportQuickSelectorProps) => {
  const featuredSports = getFeaturedSports();
  const regularSports = getRegularSports();

  const renderSportButton = (sport: Sport) => (
    <Button
      key={sport.id}
      type="button"
      size="sm"
      variant={value === sport.id ? "default" : "outline"}
      onClick={() => onChange(sport.id)}
      className={cn(
        "flex items-center gap-1.5 whitespace-nowrap shrink-0",
        value === sport.id && "ring-2 ring-primary ring-offset-2"
      )}
    >
      <span>{sport.emoji}</span>
      <span>{getSportLabel(sport.id, lang)}</span>
    </Button>
  );

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className="text-sm font-medium">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      
      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-2">
          {/* Featured sports first */}
          {featuredSports.map(renderSportButton)}
          
          {/* Divider */}
          {regularSports.length > 0 && (
            <div className="h-8 w-px bg-border shrink-0" />
          )}
          
          {/* Regular sports */}
          {regularSports.map(renderSportButton)}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      
      {required && !value && (
        <p className="text-xs text-destructive">
          {lang === 'fr' ? 'Veuillez sélectionner un sport' : 'Please select a sport'}
        </p>
      )}
    </div>
  );
};
