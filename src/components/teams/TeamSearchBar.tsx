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
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 pl-10 pr-10 text-base w-full max-w-full"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onChange("")}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 min-h-[32px] min-w-[32px]"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
