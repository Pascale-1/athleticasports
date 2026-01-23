import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  CalendarCheck, 
  MapPin, 
  X, 
  Sparkles,
  ChevronRight,
  Loader2,
  Swords,
  Users
} from "lucide-react";
import { format, addDays } from "date-fns";
import { usePlayerAvailability } from "@/hooks/usePlayerAvailability";
import { useMatchProposals } from "@/hooks/useMatchProposals";
import { useAvailableGames } from "@/hooks/useAvailableGames";
import { getSportById } from "@/lib/sports";
import { getDistrictLabel } from "@/lib/parisDistricts";
import { supabase } from "@/integrations/supabase/client";
import { AvailableGameCard } from "./AvailableGameCard";

interface QuickAvailabilityToggleProps {
  onOpenFindMatch: () => void;
  onOpenBrowseGames: () => void;
}

export const QuickAvailabilityToggle = ({ 
  onOpenFindMatch, 
  onOpenBrowseGames 
}: QuickAvailabilityToggleProps) => {
  const { t, i18n } = useTranslation('matching');
  const navigate = useNavigate();
  const lang = (i18n.language?.split('-')[0] || 'fr') as 'en' | 'fr';
  
  const { availability, loading, cancelAvailability, createAvailability } = usePlayerAvailability();
  const { proposals } = useMatchProposals();
  const pendingProposals = proposals.filter(p => p.status === 'pending');
  
  // Fetch available games when user has availability
  const { games: availableGames, loading: gamesLoading } = useAvailableGames(
    availability ? { sport: availability.sport } : undefined
  );
  const topGames = availableGames.slice(0, 2);
  
  const [userSport, setUserSport] = useState<string | null>(null);
  const [userDistrict, setUserDistrict] = useState<string | null>(null);
  const [quickEnabling, setQuickEnabling] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Fetch user defaults
  useEffect(() => {
    const fetchDefaults = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("primary_sport, preferred_district")
          .eq("user_id", user.id)
          .single();
        
        if (data) {
          setUserSport(data.primary_sport);
          setUserDistrict(data.preferred_district);
        }
      }
    };
    fetchDefaults();
  }, []);

  const handleQuickEnable = async () => {
    if (!userSport) {
      // No sport set, open full form
      onOpenFindMatch();
      return;
    }

    setQuickEnabling(true);
    try {
      await createAvailability({
        sport: userSport,
        available_from: new Date().toISOString(),
        available_until: addDays(new Date(), 7).toISOString(),
        location_district: userDistrict || undefined,
        skill_level: 3, // Default to intermediate
      });
    } finally {
      setQuickEnabling(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelAvailability();
    } finally {
      setCancelling(false);
    }
  };

  // If loading, show skeleton
  if (loading) {
    return (
      <Card className="p-4">
        <div className="h-20 animate-pulse bg-muted rounded-lg" />
      </Card>
    );
  }

  // If availability is active, show status card with inline games
  if (availability) {
    const sport = getSportById(availability.sport);
    const districtLabel = availability.location_district 
      ? getDistrictLabel(availability.location_district, lang) 
      : null;
    
    return (
      <Card className="p-4 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl flex-shrink-0">
              {sport?.emoji || '⚽'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm truncate">
                  {t('youreAvailable')}
                </h3>
                <Badge variant="default" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {t('active')}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {sport?.label[lang] || availability.sport} • {t('until')} {format(new Date(availability.available_until), "d MMM")}
              </p>
              {districtLabel && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{districtLabel}</span>
                </div>
              )}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            onClick={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Inline Available Games Preview */}
        {!gamesLoading && topGames.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 pt-3 border-t space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Swords className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  {t('gamesFound', { count: availableGames.length })}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={onOpenBrowseGames}
              >
                {t('viewAll')}
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
            
            <div className="space-y-2">
              {topGames.map((game) => (
                <AvailableGameCard 
                  key={game.id} 
                  game={game} 
                  compact 
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Pending proposals count */}
        {pendingProposals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 pt-3 border-t"
          >
            <Button
              variant="ghost"
              className="w-full justify-between h-auto py-2 px-2"
              onClick={onOpenBrowseGames}
            >
              <div className="flex items-center gap-2">
                <Badge className="bg-primary text-primary-foreground">
                  {pendingProposals.length}
                </Badge>
                <span className="text-sm">
                  {t('matchesWaiting', { count: pendingProposals.length })}
                </span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </Card>
    );
  }

  // Not available - show toggle card
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <CalendarCheck className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-medium text-sm">{t('readyToPlay')}</h3>
            <p className="text-xs text-muted-foreground">
              {t('toggleDesc')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {userSport ? (
            <Switch
              checked={false}
              onCheckedChange={handleQuickEnable}
              disabled={quickEnabling}
            />
          ) : (
            <Button 
              size="sm" 
              onClick={onOpenFindMatch}
              variant="default"
            >
              {t('setAvailability')}
            </Button>
          )}
        </div>
      </div>

      {quickEnabling && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          {t('settingUp')}
        </motion.div>
      )}
    </Card>
  );
};
