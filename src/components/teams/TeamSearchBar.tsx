import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TeamSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const TeamSearchBar = ({ 
  value, 
  onChange, 
  placeholder = "Search teams..." 
}: TeamSearchBarProps) => {
  return (
    <div className="relative w-full max-w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[hsl(var(--text-hint))] pointer-events-none" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 pl-9 pr-10 text-[12px] w-full max-w-full"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onChange("")}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 min-h-[28px] min-w-[28px]"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
};
