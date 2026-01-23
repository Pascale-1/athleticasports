import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Clock, Users, Sparkles, ChevronRight } from "lucide-react";
import { format, isToday, isTomorrow } from "date-fns";
import { getSportById } from "@/lib/sports";
import { AvailableGame } from "@/hooks/useAvailableGames";
import { getDistrictLabel } from "@/lib/parisDistricts";
import { cn } from "@/lib/utils";

interface AvailableGameCardProps {
  game: AvailableGame;
  onExpressInterest?: (gameId: string) => void;
  compact?: boolean;
  showJoinBadge?: boolean;
}

export const AvailableGameCard = ({ game, onExpressInterest, compact = false, showJoinBadge = false }: AvailableGameCardProps) => {
  const { t, i18n } = useTranslation(['common', 'matching']);
  const navigate = useNavigate();
  const lang = (i18n.language?.split('-')[0] || 'fr') as 'en' | 'fr';
  
  const sport = getSportById(game.sport || '');
  const startDate = new Date(game.start_time);
  
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

  // Match score badge
  const getMatchBadge = () => {
    if (!game.matchScore) return null;
    
    const { label, total } = game.matchScore;
    const badgeConfig = {
      perfect: { bg: 'bg-green-500', text: t('matching:labels.perfect') },
      great: { bg: 'bg-green-400', text: t('matching:labels.great') },
      good: { bg: 'bg-yellow-500', text: t('matching:labels.good') },
      fair: { bg: 'bg-gray-400', text: t('matching:labels.fair') },
    };
    
    const config = badgeConfig[label];
    return (
      <Badge className={cn("text-white text-xs", config.bg)}>
        <Sparkles className="h-3 w-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  if (compact) {
    return (
      <div 
        className="flex items-center gap-3 p-3 rounded-lg bg-white/50 dark:bg-emerald-900/20 hover:bg-white dark:hover:bg-emerald-900/30 cursor-pointer transition-colors"
        onClick={() => navigate(`/events/${game.id}`)}
      >
        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0 text-lg">
          {sport?.emoji || '⚽'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm truncate">{game.title}</p>
            {getMatchBadge()}
          </div>
          <p className="text-xs text-muted-foreground">
            {formatGameDate()} • {getLocationLabel()}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {game.spotsLeft !== undefined && (
            <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
              <Users className="h-3 w-3 mr-1" />
              {game.spotsLeft}
            </Badge>
          )}
          {showJoinBadge && (
            <Badge className="bg-emerald-500 text-white text-xs px-1.5 py-0.5">
              {t('matching:actions.join')}
            </Badge>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="p-4 space-y-3 hover:shadow-md transition-shadow">
      {/* Header with sport and match score */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
            {sport?.emoji || '⚽'}
          </div>
          <div>
            <h3 className="font-semibold text-base line-clamp-1">{game.title}</h3>
            <p className="text-sm text-muted-foreground">
              {sport?.label[lang] || game.sport}
            </p>
          </div>
        </div>
        {getMatchBadge()}
      </div>

      {/* Details */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          <span>{formatGameDate()}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4" />
          <span>{getLocationLabel()}</span>
        </div>
        {game.spotsLeft !== undefined && (
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
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
        <div className="flex items-center gap-2 text-sm">
          <Avatar className="h-6 w-6">
            <AvatarImage src={game.organizerAvatar || undefined} />
            <AvatarFallback className="text-xs">
              {game.organizerName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-muted-foreground">
            {t('matching:organizedBy', { name: game.organizerName })}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        {onExpressInterest && game.spotsLeft !== 0 && (
          <Button 
            size="sm" 
            className="flex-1"
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
          className={onExpressInterest ? "" : "flex-1"}
          onClick={() => navigate(`/events/${game.id}`)}
        >
          {t('common:actions.viewDetails')}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </Card>
  );
};
