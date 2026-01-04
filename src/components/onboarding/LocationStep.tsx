import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { MapPin, Globe } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  PARIS_DISTRICTS, 
  NEARBY_CITIES, 
  getDistrictsByZone, 
  ZONE_LABELS,
  type District 
} from "@/lib/parisDistricts";

interface LocationStepProps {
  selectedDistrict: string | null;
  otherCity: string;
  onSelectDistrict: (district: string) => void;
  onOtherCityChange: (city: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const LocationStep = ({ 
  selectedDistrict, 
  otherCity,
  onSelectDistrict, 
  onOtherCityChange,
  onNext, 
  onBack 
}: LocationStepProps) => {
  const { t, i18n } = useTranslation("onboarding");
  const lang = (i18n.language?.split('-')[0] || 'fr') as 'en' | 'fr';
  
  const centreDistricts = getDistrictsByZone('centre');
  const riveDroiteDistricts = getDistrictsByZone('rive_droite');
  const riveGaucheDistricts = getDistrictsByZone('rive_gauche');

  const isOtherSelected = selectedDistrict === 'other';
  const canContinue = selectedDistrict && (selectedDistrict !== 'other' || otherCity.trim().length > 0);

  const renderDistrictItem = (district: District) => (
    <SelectItem key={district.id} value={district.id}>
      {district.nameFr}
    </SelectItem>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex flex-col min-h-[70vh] px-6"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">{t("location.title")}</h2>
        <p className="text-muted-foreground">{t("location.subtitle")}</p>
      </div>

      {/* Paris Note */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-6 text-center"
      >
        <p className="text-sm text-muted-foreground">
          <MapPin className="inline w-4 h-4 mr-1 text-primary" />
          {t("location.parisNote")}
        </p>
      </motion.div>

      {/* District Selector */}
      <div className="space-y-4 flex-1">
        <Select 
          value={selectedDistrict || ''} 
          onValueChange={onSelectDistrict}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("location.selectDistrict")} />
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

            {/* Other City Option */}
            <SelectGroup>
              <SelectLabel className="flex items-center gap-2">
                <Globe className="w-4 h-4" /> {lang === 'fr' ? 'Autre' : 'Other'}
              </SelectLabel>
              <SelectItem value="other">
                {t("location.otherCity")}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Other City Input */}
        {isOtherSelected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-2"
          >
            <Input
              placeholder={t("location.otherCityPlaceholder")}
              value={otherCity}
              onChange={(e) => onOtherCityChange(e.target.value)}
              className="w-full"
            />
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-auto pb-6">
        <Button variant="outline" onClick={onBack} className="flex-1">
          {lang === 'fr' ? 'Retour' : 'Back'}
        </Button>
        <Button onClick={onNext} disabled={!canContinue} className="flex-1">
          {lang === 'fr' ? 'Continuer' : 'Continue'}
        </Button>
      </div>
    </motion.div>
  );
};
