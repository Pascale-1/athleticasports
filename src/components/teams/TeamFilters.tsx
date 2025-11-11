import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const SPORTS = [
  "All",
  "Basketball",
  "Soccer",
  "Running",
  "Volleyball",
  "Cycling",
  "Gym",
  "Yoga",
  "Other"
];

interface TeamFiltersProps {
  activeSport: string;
  onSportChange: (sport: string) => void;
}

export const TeamFilters = ({ activeSport, onSportChange }: TeamFiltersProps) => {
  return (
    <div className="w-full max-w-full">
      <div className="flex flex-wrap gap-2 pb-2">
        {SPORTS.map((sport) => (
          <Button
            key={sport}
            variant={activeSport === sport ? "default" : "outline"}
            onClick={() => onSportChange(sport)}
            className="h-11 px-4 text-sm"
          >
            {sport}
          </Button>
        ))}
      </div>
    </div>
  );
};
