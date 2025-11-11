import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const sports = ["All", "Soccer", "Basketball", "Running", "Cycling", "Swimming", "Tennis", "Volleyball"];

interface SportFilterProps {
  activeSport: string;
  onSportChange: (sport: string) => void;
}

export const SportFilter = ({ activeSport, onSportChange }: SportFilterProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
      {sports.map((sport, index) => (
        <motion.div
          key={sport}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Badge
            variant={activeSport === sport ? "default" : "outline"}
            className={cn(
              "cursor-pointer whitespace-nowrap transition-all",
              activeSport === sport 
                ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                : "hover:bg-accent"
            )}
            onClick={() => onSportChange(sport)}
          >
            {sport}
          </Badge>
        </motion.div>
      ))}
    </div>
  );
};
