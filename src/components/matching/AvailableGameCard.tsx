import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DateBlock } from "@/components/ui/date-block";
import { MapPin, Clock, Users, Sparkles, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { getSportById, getSportEmoji } from "@/lib/sports";
import { AvailableGame } from "@/hooks/useAvailableGames";
import { getDistrictLabel } from "@/lib/parisDistricts";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AvailableGameCardProps {
  game: AvailableGame;
  onExpressInterest?: (gameId: string) => void;
  onQuickJoin?: (gameId: string) => void;
  compact?: boolean;
  showJoinBadge?: boolean;
  isUserAttending?: boolean;
}

export const AvailableGameCard = ({ 
  game, 
  onExpressInterest, 
  onQuickJoin,
  compact = false, 
  showJoinBadge = false,
  isUserAttending = false
}: AvailableGameCardProps) => {
  const { t, i18n } = useTranslation(['common', 'matching']);
  const navigate = useNavigate();
  const lang = (i18n.language?.split('-')[0] || 'fr') as 'en' | 'fr';
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(isUserAttending);
  
  const sport = getSportById(game.sport || '');
  const sportEmoji = getSportEmoji(game.sport || '');
  const startDate = new Date(game.start_time);
  
  const handleQuickJoin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsJoining(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error(t('common:errors.unauthorized'));
        return;
      }

      const { error } = await supabase
        .from("event_attendance" as any)
        .upsert({
          event_id: game.id,
          user_id: user.id,
          status: 'attending',
        }, {
          onConflict: 'event_id,user_id'
        });

      if (error) throw error;

      setHasJoined(true);
      toast.success(t('matching:joinedSuccess'));
      onQuickJoin?.(game.id);
    } catch (error: any) {
      console.error("Error joining game:", error);
      toast.error(error.message || t('common:errors.generic'));
    } finally {
      setIsJoining(false);
    }
  };

  const getLocationLabel = () => {
    if (game.location_district) return getDistrictLabel(game.location_district, lang);
    if (game.location) return game.location.length > 25 ? game.location.substring(0, 25) + '...' : game.location;
    return t('common:location.tbd');
  };

  const getMatchBadge = () => {
    if (!game.matchScore) return null;
    const { label } = game.matchScore;
    const config: Record<string, { className: string; text: string }> = {
      perfect: { className: 'bg-success text-success-foreground', text: t('matching:labels.perfect') },
      great: { className: 'bg-primary text-primary-foreground', text: t('matching:labels.great') },
      good: { className: 'bg-info text-info-foreground', text: t('matching:labels.good') },
      fair: { className: 'bg-muted text-muted-foreground', text: t('matching:labels.fair') },
    };
    const c = config[label];
    if (!c) return null;
    return (
      <Badge size="xs" className={cn("gap-0.5", c.className)}>
        <Sparkles className="h-2.5 w-2.5" />
        {c.text}
      </Badge>
    );
  };

  // Compact view
  if (compact) {
    return (
      <Card 
        variant="interactive"
        className="cursor-pointer"
        onClick={() => navigate(`/events/${game.id}`)}
      >
        <CardContent className="p-2.5">
          <div className="flex gap-2.5">
            <DateBlock date={startDate} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{sportEmoji}</span>
                <h4 className="text-card-title font-heading font-semibold truncate">{game.title}</h4>
                {getMatchBadge()}
              </div>
              <div className="flex items-center gap-1 text-caption text-muted-foreground mt-0.5">
                <Clock className="h-2.5 w-2.5 shrink-0" />
                <span>{startDate.toLocaleTimeString(lang === 'fr' ? 'fr-FR' : 'en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                <span className="text-muted-foreground/50">·</span>
                <MapPin className="h-2.5 w-2.5 shrink-0" />
                <span className="truncate">{getLocationLabel()}</span>
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <div className="flex items-center gap-1 text-caption text-muted-foreground">
                  <Users className="h-2.5 w-2.5" />
                  <span>{game.spotsLeft !== undefined ? `${game.spotsLeft} left` : ''}</span>
                </div>
                {hasJoined ? (
                  <Badge size="xs" className="bg-success text-success-foreground">
                    <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                    {t('matching:labels.joined')}
                  </Badge>
                ) : showJoinBadge && game.spotsLeft !== 0 ? (
                  <Button size="sm" className="h-6 px-2 text-[10px] gap-1" onClick={handleQuickJoin} disabled={isJoining}>
                    {isJoining ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <>{t('matching:actions.join')}<ArrowRight className="h-2.5 w-2.5" /></>}
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full card
  return (
    <Card variant="interactive" className="cursor-pointer overflow-hidden" onClick={() => navigate(`/events/${game.id}`)}>
      {game.matchScore && (
        <div className={cn("px-3 py-1.5 text-caption font-medium", game.matchScore.label === 'perfect' ? 'bg-success text-success-foreground' : 'bg-primary text-primary-foreground')}>
          ⭐ {t(`matching:labels.${game.matchScore.label}`).toUpperCase()} MATCH
        </div>
      )}
      <CardContent className={cn("p-3", game.matchScore && "pt-2")}>
        <div className="flex gap-3">
          <DateBlock date={startDate} size="md" />
          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base">{sportEmoji}</span>
                <h4 className="text-card-title font-heading font-semibold truncate">{game.title}</h4>
              </div>
              <div className="flex items-center gap-1.5 text-caption text-muted-foreground mt-0.5">
                <Clock className="h-3 w-3" />
                <span>{startDate.toLocaleTimeString(lang === 'fr' ? 'fr-FR' : 'en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                <span className="text-muted-foreground/50">·</span>
                <MapPin className="h-3 w-3" />
                <span className="truncate">{getLocationLabel()}</span>
                {game.spotsLeft !== undefined && (
                  <>
                    <span className="text-muted-foreground/50">·</span>
                    <Users className="h-3 w-3" />
                    <span>{game.spotsLeft} left</span>
                  </>
                )}
              </div>
            </div>
            <Button size="sm" variant={hasJoined ? "secondary" : "default"} className="w-full h-8 text-xs gap-1.5" onClick={handleQuickJoin} disabled={isJoining || hasJoined}>
              {hasJoined ? <><CheckCircle2 className="h-3 w-3" />{t('matching:labels.joined')}</> : isJoining ? <Loader2 className="h-3 w-3 animate-spin" /> : <>{t('matching:actions.join')}<ArrowRight className="h-3 w-3" /></>}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
