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
    <div className="relative w-full max-w-full overflow-hidden">
      <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-2 pr-12">
          {SPORTS.map((sport) => (
            <Button
              key={sport}
              variant={activeSport === sport ? "default" : "outline"}
              onClick={() => onSportChange(sport)}
              className="shrink-0 h-11 px-4 min-w-0"
            >
              {sport}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};
