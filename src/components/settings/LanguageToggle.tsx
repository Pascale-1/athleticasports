import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const languages = {
  fr: { flag: '🇫🇷', label: 'Français' },
  en: { flag: '🇬🇧', label: 'English' },
} as const;

export const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const currentLang = (i18n.language?.split('-')[0] || 'fr') as keyof typeof languages;

  const toggleLanguage = () => {
    const newLang = currentLang === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
    localStorage.setItem('athletica_language', newLang);
  };

  const current = languages[currentLang] || languages.fr;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-full text-base"
          onClick={toggleLanguage}
        >
          {current.flag}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{current.label}</p>
      </TooltipContent>
    </Tooltip>
  );
};
