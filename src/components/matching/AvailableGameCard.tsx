import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Clock, Users, Sparkles, ChevronRight, CheckCircle2, Loader2 } from "lucide-react";
import { format, isToday, isTomorrow } from "date-fns";
import { getSportById } from "@/lib/sports";
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
  const startDate = new Date(game.start_time);
  
  // Quick Join handler
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
  
  // Format date smartly
  const formatGameDate = () => {
    if (isToday(startDate)) {
      return `${t('common:time.today')} ${format(startDate, 'HH:mm')}`;
    }
    if (isTomorrow(startDate)) {
      return `${t('common:time.tomorrow')} ${format(startDate, 'HH:mm')}`;
    }
    return format(startDate, "EEE d MMM, HH:mm");
  };

  // Get location label
  const getLocationLabel = () => {
    if (game.location_district) {
      return getDistrictLabel(game.location_district, lang);
    }
    if (game.location) {
      // Truncate if too long
      return game.location.length > 30 
        ? game.location.substring(0, 30) + '...' 
        : game.location;
    }
    return t('common:location.tbd');
  };

  // Match score badge - enhanced for visibility
  const getMatchBadge = () => {
    if (!game.matchScore) return null;
    
    const { label, total } = game.matchScore;
    const badgeConfig: Record<string, { className: string; text: string }> = {
      perfect: { className: 'bg-green-500 text-white', text: t('matching:labels.perfect') },
      great: { className: 'bg-blue-500 text-white', text: t('matching:labels.great') },
      good: { className: 'bg-amber-500 text-white', text: t('matching:labels.good') },
      fair: { className: 'bg-slate-400 text-white', text: t('matching:labels.fair') },
    };
    
    const config = badgeConfig[label];
    if (!config) return null;
    
    return (
      <Badge className={cn("text-xs font-medium", config.className)}>
        <Sparkles className="h-3 w-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  if (compact) {
    return (
      <div 
        className="flex items-center gap-2 p-2.5 rounded-md bg-white/50 dark:bg-emerald-900/20 hover:bg-white dark:hover:bg-emerald-900/30 cursor-pointer transition-colors active:scale-[0.98]"
        onClick={() => navigate(`/events/${game.id}`)}
      >
        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0 text-base">
          {sport?.emoji || '⚽'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-medium text-[12px] truncate">{game.title}</p>
            {getMatchBadge()}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {formatGameDate()} • {getLocationLabel()}
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {game.spotsLeft !== undefined && game.spotsLeft > 0 && !hasJoined && (
            <Badge variant="secondary" size="sm" className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
              <Users className="h-2.5 w-2.5 mr-0.5" />
              {game.spotsLeft}
            </Badge>
          )}
          {hasJoined ? (
            <Badge size="sm" className="bg-primary text-primary-foreground">
              <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
              {t('matching:labels.joined')}
            </Badge>
          ) : showJoinBadge && game.spotsLeft !== 0 ? (
            <Button
              size="sm"
              className="h-6 text-[11px] bg-emerald-500 hover:bg-emerald-600 text-white px-2"
              onClick={handleQuickJoin}
              disabled={isJoining}
            >
              {isJoining ? (
                <Loader2 className="h-2.5 w-2.5 animate-spin" />
              ) : (
                t('matching:actions.join')
              )}
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <Card className="p-2.5 space-y-1.5 hover:shadow-md transition-shadow active:scale-[0.99]">
      {/* Header with sport and match score */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-lg">
            {sport?.emoji || '⚽'}
          </div>
          <div>
            <h3 className="font-semibold text-[12px] line-clamp-1">{game.title}</h3>
            <p className="text-[11px] text-muted-foreground">
              {sport?.label[lang] || game.sport}
            </p>
          </div>
        </div>
        {getMatchBadge()}
      </div>

      {/* Details */}
      <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-0.5">
          <Clock className="h-3 w-3" />
          <span>{formatGameDate()}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <MapPin className="h-3 w-3" />
          <span>{getLocationLabel()}</span>
        </div>
        {game.spotsLeft !== undefined && (
          <div className="flex items-center gap-0.5">
            <Users className="h-3 w-3" />
            <span>
              {game.spotsLeft === 0 
                ? t('matching:full')
                : t('matching:spotsLeft', { count: game.spotsLeft })}
            </span>
          </div>
        )}
      </div>

      {/* Organizer */}
      {game.organizerName && (
        <div className="flex items-center gap-1 text-[11px]">
          <Avatar className="h-4 w-4">
            <AvatarImage src={game.organizerAvatar || undefined} />
            <AvatarFallback className="text-[8px]">
              {game.organizerName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-muted-foreground">
            {t('matching:organizedBy', { name: game.organizerName })}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-1.5">
        {onExpressInterest && game.spotsLeft !== 0 && (
          <Button 
            size="sm" 
            className="flex-1 h-7 text-[11px]"
            onClick={(e) => {
              e.stopPropagation();
              onExpressInterest(game.id);
            }}
          >
            {t('matching:expressInterest')}
          </Button>
        )}
        <Button 
          size="sm" 
          variant={onExpressInterest ? "outline" : "default"}
          className={cn("h-7 text-[11px]", !onExpressInterest && "flex-1")}
          onClick={() => navigate(`/events/${game.id}`)}
        >
          {t('common:actions.viewDetails')}
          <ChevronRight className="h-3 w-3 ml-0.5" />
        </Button>
      </div>
    </Card>
  );
};
