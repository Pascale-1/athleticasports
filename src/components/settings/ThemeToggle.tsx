import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const themes = [
  { value: "system", icon: Monitor, labelKey: "settings.themeSystem" },
  { value: "light", icon: Sun, labelKey: "settings.themeLight" },
  { value: "dark", icon: Moon, labelKey: "settings.themeDark" },
] as const;

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation("common");

  return (
    <div className="flex gap-1.5 w-full">
      {themes.map(({ value, icon: Icon, labelKey }) => (
        <Button
          key={value}
          variant="outline"
          size="sm"
          onClick={() => setTheme(value)}
          className={cn(
            "flex-1 gap-1.5 text-xs h-9",
            theme === value && "bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground"
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          {t(labelKey, value.charAt(0).toUpperCase() + value.slice(1))}
        </Button>
      ))}
    </div>
  );
};
