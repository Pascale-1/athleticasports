import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MapPin, Loader2, X, Globe, ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const COUNTRIES = [
  { code: "fr", label: "🇫🇷", name: "France" },
  { code: "gb", label: "🇬🇧", name: "UK" },
  { code: "us", label: "🇺🇸", name: "USA" },
  { code: "de", label: "🇩🇪", name: "Germany" },
  { code: "es", label: "🇪🇸", name: "Spain" },
  { code: "it", label: "🇮🇹", name: "Italy" },
  { code: "be", label: "🇧🇪", name: "Belgium" },
  { code: "ch", label: "🇨🇭", name: "Switzerland" },
  { code: "nl", label: "🇳🇱", name: "Netherlands" },
  { code: "pt", label: "🇵🇹", name: "Portugal" },
  { code: "", label: "🌍", name: "All" },
] as const;

interface AddressSuggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    house_number?: string;
    road?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    postcode?: string;
    country?: string;
  };
}

const isAddressFormatValid = (str: string): boolean => {
  if (!str || str.trim().length < 5) return false;
  const parts = str.split(',').map(p => p.trim()).filter(p => p.length >= 2);
  return parts.length >= 2;
};

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string, coordinates?: { lat: number; lng: number }) => void;
  onValidChange?: (isValid: boolean) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  ghost?: boolean;
}

export const AddressAutocomplete = ({
  value,
  onChange,
  onValidChange,
  label,
  placeholder,
  className,
  disabled = false,
  ghost = false,
}: AddressAutocompleteProps) => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'fr';

  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedCountry, setSelectedCountry] = useState("fr");

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  // Re-search when country changes
  useEffect(() => {
    if (inputValue.length >= 3) {
      searchAddress(inputValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry]);

  const searchAddress = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        q: query,
        format: "json",
        addressdetails: "1",
        limit: "5",
        "accept-language": lang,
      });

      if (selectedCountry) {
        params.set("countrycodes", selectedCountry);
      }

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params}`,
        {
          headers: {
            "User-Agent": "AthleticaSports/1.0", // Required by Nominatim ToS
          },
        }
      );

      if (!response.ok) throw new Error("Search failed");

      const data: AddressSuggestion[] = await response.json();
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error("Error searching address:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [lang, selectedCountry]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue); // Update parent immediately
    onValidChange?.(isAddressFormatValid(newValue));

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchAddress(newValue);
    }, 300);
  };

  const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
    const address = formatAddress(suggestion, inputValue);
    setInputValue(address);
    onChange(address, {
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon),
    });
    onValidChange?.(true);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        break;
    }
  };

  const handleClear = () => {
    setInputValue("");
    onChange("");
    onValidChange?.(false);
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const formatAddress = (suggestion: AddressSuggestion, userInput: string): string => {
    const addr = suggestion.address;
    if (!addr) return suggestion.display_name;

    const parts: string[] = [];

    // Extract house number from user input if not provided by API
    let houseNumber = addr.house_number;
    if (!houseNumber && addr.road) {
      // Try to extract number from the beginning of user input
      const numberMatch = userInput.match(/^(\d+[a-zA-Z]?)\s/);
      if (numberMatch) {
        houseNumber = numberMatch[1];
      }
    }

    // Street address
    if (houseNumber && addr.road) {
      parts.push(`${houseNumber} ${addr.road}`);
    } else if (addr.road) {
      parts.push(addr.road);
    }

    // City/Town
    const city = addr.city || addr.town || addr.village || addr.municipality;
    if (city) {
      if (addr.postcode) {
        parts.push(`${addr.postcode} ${city}`);
      } else {
        parts.push(city);
      }
    }

    return parts.length > 0 ? parts.join(", ") : suggestion.display_name;
  };

  const formatSuggestionDisplay = (suggestion: AddressSuggestion): { main: string; secondary: string } => {
    const addr = suggestion.address;
    if (!addr) {
      return { main: suggestion.display_name, secondary: "" };
    }

    let main = "";
    let secondary = "";

    // Main line: street address or place name
    if (addr.house_number && addr.road) {
      main = `${addr.house_number} ${addr.road}`;
    } else if (addr.road) {
      main = addr.road;
    } else {
      main = suggestion.display_name.split(",")[0];
    }

    // Secondary line: city, postcode
    const city = addr.city || addr.town || addr.village || addr.municipality || addr.suburb;
    if (city) {
      secondary = addr.postcode ? `${addr.postcode} ${city}` : city;
    }

    return { main, secondary };
  };

  return (
    <div ref={containerRef} className={cn("relative space-y-2 w-full min-w-0", showSuggestions && suggestions.length > 0 && "pb-[220px]", className)}>
      {label && (
        <Label className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          {label}
        </Label>
      )}

      {ghost ? (
        /* Ghost mode: minimal inline flag button + popover for country */
        <div className="flex gap-1 items-center">
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="shrink-0 flex items-center gap-0.5 text-base leading-none px-1 py-0.5 bg-transparent border-0 outline-none rounded-sm hover:bg-muted transition-colors"
              >
                {COUNTRIES.find(c => c.code === selectedCountry)?.label || "🌍"}
                <ChevronDown className="h-2.5 w-2.5 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-1" align="start">
              {COUNTRIES.map((country) => (
                <button
                  key={country.code || "all"}
                  type="button"
                  onClick={() => setSelectedCountry(country.code)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-accent transition-colors",
                    selectedCountry === country.code && "bg-accent"
                  )}
                >
                  <span>{country.label}</span>
                  <span className="text-xs text-muted-foreground">{country.name}</span>
                </button>
              ))}
            </PopoverContent>
          </Popover>

          <div className="relative flex-1 min-w-0">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder={placeholder || (lang === "fr" ? "Rechercher une adresse..." : "Search for an address...")}
              disabled={disabled}
              className="w-full bg-transparent border-b border-border/40 focus:border-primary outline-none text-sm placeholder:text-muted-foreground/50 text-foreground pr-8 pb-1 transition-all duration-200"
              autoComplete="off"
            />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {isLoading && (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              )}
              {inputValue && !isLoading && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-0.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Normal mode: full Select + Input */
        <div className="flex gap-1.5 items-center">
          <Select value={selectedCountry || "__all__"} onValueChange={(val) => setSelectedCountry(val === "__all__" ? "" : val)}>
            <SelectTrigger className="w-[52px] shrink-0 h-9 px-1.5">
              <SelectValue>
                {COUNTRIES.find(c => c.code === selectedCountry)?.label || "🌍"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country.code || "all"} value={country.code || "__all__"}>
                  <span className="flex items-center gap-2">
                    <span>{country.label}</span>
                    <span className="text-xs text-muted-foreground">{country.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative flex-1 min-w-0">
            <Input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder={placeholder || (lang === "fr" ? "Rechercher une adresse..." : "Search for an address...")}
              disabled={disabled}
              className="pr-16"
              autoComplete="off"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {isLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              {inputValue && !isLoading && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-[240px] overflow-y-auto">
          {suggestions.map((suggestion, index) => {
            const { main, secondary } = formatSuggestionDisplay(suggestion);
            return (
              <button
                key={suggestion.place_id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelectSuggestion(suggestion);
                }}
                className={cn(
                  "w-full px-3 py-2 text-left hover:bg-accent transition-colors flex items-start gap-2",
                  index === selectedIndex && "bg-accent"
                )}
              >
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{main}</div>
                  {secondary && (
                    <div className="text-xs text-muted-foreground truncate">{secondary}</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Format hint */}
      {!ghost && (
        <p className="text-[11px] text-muted-foreground/60 mt-1">
          {lang === 'fr'
            ? 'Format : rue, ville — ex: 12 Rue de Rivoli, 75001 Paris'
            : 'Format: street, city — e.g. 12 Rue de Rivoli, 75001 Paris'}
        </p>
      )}
    </div>
  );
};
