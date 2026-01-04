import { useState } from "react";
import { useTranslation } from "react-i18next";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";
import { 
  PARIS_DISTRICTS, 
  NEARBY_CITIES, 
  getDistrictsByZone, 
  ZONE_LABELS,
  type District 
} from "@/lib/parisDistricts";

interface DistrictSelectorProps {
  value: { district: string; venueName?: string };
  onChange: (value: { district: string; venueName?: string }) => void;
  showVenueName?: boolean;
  placeholder?: string;
  label?: string;
  venueLabel?: string;
  venuePlaceholder?: string;
}

export const DistrictSelector = ({ 
  value, 
  onChange, 
  showVenueName = true,
  placeholder,
  label,
  venueLabel,
  venuePlaceholder,
}: DistrictSelectorProps) => {
  const { i18n, t } = useTranslation();
  const lang = (i18n.language?.split('-')[0] || 'fr') as 'en' | 'fr';
  
  const centreDistricts = getDistrictsByZone('centre');
  const riveDroiteDistricts = getDistrictsByZone('rive_droite');
  const riveGaucheDistricts = getDistrictsByZone('rive_gauche');

  const renderDistrictItem = (district: District) => (
    <SelectItem key={district.id} value={district.id}>
      {district.nameFr}
    </SelectItem>
  );

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {label && <Label className="flex items-center gap-2"><MapPin className="h-4 w-4" />{label}</Label>}
        <Select 
          value={value.district} 
          onValueChange={(district) => onChange({ ...value, district })}
        >
          <SelectTrigger>
            <SelectValue placeholder={placeholder || (lang === 'fr' ? 'Sélectionner un arrondissement' : 'Select district')} />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {/* Paris Centre */}
            <SelectGroup>
              <SelectLabel className="flex items-center gap-2">
                🏛️ {ZONE_LABELS.centre[lang]}
              </SelectLabel>
              {centreDistricts.map(renderDistrictItem)}
            </SelectGroup>
            
            {/* Rive Droite */}
            <SelectGroup>
              <SelectLabel className="flex items-center gap-2">
                🌳 {ZONE_LABELS.rive_droite[lang]}
              </SelectLabel>
              {riveDroiteDistricts.map(renderDistrictItem)}
            </SelectGroup>
            
            {/* Rive Gauche */}
            <SelectGroup>
              <SelectLabel className="flex items-center gap-2">
                🌊 {ZONE_LABELS.rive_gauche[lang]}
              </SelectLabel>
              {riveGaucheDistricts.map(renderDistrictItem)}
            </SelectGroup>
            
            {/* Nearby Cities */}
            <SelectGroup>
              <SelectLabel className="flex items-center gap-2">
                🏘️ {ZONE_LABELS.banlieue[lang]}
              </SelectLabel>
              {NEARBY_CITIES.map(renderDistrictItem)}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      
      {showVenueName && (
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">
            {venueLabel || (lang === 'fr' ? 'Nom du lieu (optionnel)' : 'Venue name (optional)')}
          </Label>
          <Input
            placeholder={venuePlaceholder || (lang === 'fr' ? 'ex: Tennis Club Paris 12' : 'e.g., Tennis Club Paris 12')}
            value={value.venueName || ''}
            onChange={(e) => onChange({ ...value, venueName: e.target.value })}
          />
        </div>
      )}
    </div>
  );
};
