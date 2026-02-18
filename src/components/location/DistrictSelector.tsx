import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";
import { AddressAutocomplete } from "./AddressAutocomplete";

interface DistrictSelectorProps {
  value: { district: string; venueName?: string };
  onChange: (value: { district: string; venueName?: string; coordinates?: { lat: number; lng: number } }) => void;
  showVenueName?: boolean;
  placeholder?: string;
  label?: string;
  venueLabel?: string;
  venuePlaceholder?: string;
  ghost?: boolean;
}

export const DistrictSelector = ({
  value,
  onChange,
  placeholder,
  label,
  venuePlaceholder,
  ghost = false,
}: DistrictSelectorProps) => {
  const { i18n } = useTranslation();
  const lang = (i18n.language?.split('-')[0] || 'fr') as 'en' | 'fr';

  const handleAddressChange = (address: string, coordinates?: { lat: number; lng: number }) => {
    onChange({
      district: '',
      venueName: address,
      coordinates
    });
  };

  return (
    <div className="space-y-2 min-w-0">
      {label && (
        <Label className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          {label}
        </Label>
      )}
      <AddressAutocomplete
        value={value.venueName || ''}
        onChange={handleAddressChange}
        placeholder={venuePlaceholder || placeholder || (lang === 'fr' ? 'Rechercher une adresse...' : 'Search for an address...')}
        ghost={ghost}
      />
    </div>
  );
};
