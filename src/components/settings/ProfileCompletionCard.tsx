import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, ChevronRight, X } from "lucide-react";

interface ProfileCompletionCardProps {
  profile: {
    avatar_url?: string | null;
    display_name?: string | null;
    bio?: string | null;
    primary_sport?: string | null;
  };
  onGoToAbout: () => void;
}

const COMPLETION_FIELDS = [
  { key: 'avatar_url', labelKey: 'profileCompletion.addPhoto' },
  { key: 'display_name', labelKey: 'profileCompletion.addDisplayName' },
  { key: 'bio', labelKey: 'profileCompletion.addBio' },
  { key: 'primary_sport', labelKey: 'profileCompletion.addSport' },
] as const;

export const ProfileCompletionCard = ({ profile, onGoToAbout }: ProfileCompletionCardProps) => {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem('profile-completion-dismissed') === 'true'; }
    catch { return false; }
  });

  const completedFields = COMPLETION_FIELDS.filter(
    f => !!profile[f.key as keyof typeof profile]
  );
  const percentage = Math.round((completedFields.length / COMPLETION_FIELDS.length) * 100);
  const missingFields = COMPLETION_FIELDS.filter(
    f => !profile[f.key as keyof typeof profile]
  );

  if (percentage === 100 || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try { localStorage.setItem('profile-completion-dismissed', 'true'); }
    catch {}
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="pt-5 pb-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">{t('profileCompletion.title')}</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-primary">{percentage}%</span>
            <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <Progress value={percentage} className="h-2" />

        <div className="space-y-1.5">
          {COMPLETION_FIELDS.map(field => {
            const done = !!profile[field.key as keyof typeof profile];
            return (
              <div key={field.key} className="flex items-center gap-2 text-xs">
                {done ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                ) : (
                  <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                )}
                <span className={done ? "text-muted-foreground line-through" : "text-foreground"}>
                  {t(field.labelKey)}
                </span>
              </div>
            );
          })}
        </div>

        {missingFields.length > 0 && (
          <Button size="sm" variant="outline" className="w-full gap-1" onClick={onGoToAbout}>
            {t('profileCompletion.complete')}
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};