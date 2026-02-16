import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getFeaturedSports, getRegularSports, getSportLabel, getSportById } from "@/lib/sports";
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
  const selectedSport = value ? getSportById(value) : null;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className="text-xs font-medium">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger className="w-full h-9 text-xs">
          <SelectValue placeholder={lang === 'fr' ? 'Sélectionner un sport' : 'Select a sport'}>
            {selectedSport && (
              <span className="flex items-center gap-2">
                <span>{selectedSport.emoji}</span>
                <span>{getSportLabel(selectedSport.id, lang)}</span>
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-background" onCloseAutoFocus={(e) => e.preventDefault()}>
          {[...featuredSports, ...regularSports].map((sport) => (
            <SelectItem key={sport.id} value={sport.id}>
              <span className="flex items-center gap-2">
                <span>{sport.emoji}</span>
                <span>{getSportLabel(sport.id, lang)}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {required && !value && (
        <p className="text-xs text-destructive">
          {lang === 'fr' ? 'Veuillez sélectionner un sport' : 'Please select a sport'}
        </p>
      )}
    </div>
  );
};
