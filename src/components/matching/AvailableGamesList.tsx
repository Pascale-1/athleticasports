import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, MapPin, Sparkles, Gamepad2, X } from "lucide-react";
import { useAvailableGames, AvailableGamesFilters } from "@/hooks/useAvailableGames";
import { AvailableGameCard } from "./AvailableGameCard";
import { getFeaturedSports, getRegularSports } from "@/lib/sports";
import { PARIS_DISTRICTS, NEARBY_CITIES } from "@/lib/parisDistricts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AvailableGamesListProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AvailableGamesList = ({ open, onOpenChange }: AvailableGamesListProps) => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const lang = (i18n.language?.split('-')[0] || 'fr') as 'en' | 'fr';
  
  const [filters, setFilters] = useState<AvailableGamesFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  
  const { games, loading, userAvailability, refetch } = useAvailableGames(filters);
  
  const featuredSports = getFeaturedSports();
  const regularSports = getRegularSports();

  const handleExpressInterest = async (gameId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: t('errors.notAuthenticated'),
          description: t('errors.loginRequired'),
          variant: "destructive",
        });
        return;
      }

      // Check if already interested/attending
      const { data: existing } = await supabase
        .from("event_attendance")
        .select("id")
        .eq("event_id", gameId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        toast({
          title: t('matching.alreadyInterested'),
          variant: "default",
        });
        return;
      }

      // Add as "interested" (not fully attending yet)
      const { error } = await supabase
        .from("event_attendance")
        .insert({
          event_id: gameId,
          user_id: user.id,
          status: "maybe", // Soft interest
          is_committed: false,
        });

      if (error) throw error;

      toast({
        title: t('matching.interestExpressed'),
        description: t('matching.interestDesc'),
      });

      refetch();
    } catch (error: any) {
      console.error("Error expressing interest:", error);
      toast({
        title: t('errors.generic'),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = filters.sport || filters.district;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] overflow-hidden flex flex-col">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-primary" />
            {t('matching.browseGames')}
          </SheetTitle>
          <SheetDescription>
            {t('matching.browseGamesDesc')}
          </SheetDescription>
        </SheetHeader>

        {/* Availability status banner */}
        {userAvailability && (
          <div className="flex-shrink-0 mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-sm">
              {t('matching.scoringActive', { sport: userAvailability.sport })}
            </span>
          </div>
        )}

        {/* Filter bar */}
        <div className="flex-shrink-0 mt-4 space-y-3">
          <div className="flex gap-2">
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-1"
            >
              <Filter className="h-4 w-4" />
              {t('common.filters')}
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 justify-center">
                  {[filters.sport, filters.district].filter(Boolean).length}
                </Badge>
              )}
            </Button>
            
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="gap-1 text-muted-foreground"
              >
                <X className="h-4 w-4" />
                {t('common.clearFilters')}
              </Button>
            )}
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-2 gap-3"
            >
              {/* Sport filter */}
              <Select 
                value={filters.sport || ""} 
                onValueChange={(v) => setFilters(f => ({ ...f, sport: v || undefined }))}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={t('matching.filterBySport')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('common.all')}</SelectItem>
                  <SelectGroup>
                    <SelectLabel>{t('matching.sports.popular')}</SelectLabel>
                    {featuredSports.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.emoji} {s.label[lang]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>{t('matching.sports.other')}</SelectLabel>
                    {regularSports.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.emoji} {s.label[lang]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              {/* Location filter */}
              <Select 
                value={filters.district || ""} 
                onValueChange={(v) => setFilters(f => ({ ...f, district: v || undefined }))}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={t('matching.filterByLocation')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('common.all')}</SelectItem>
                  <SelectGroup>
                    <SelectLabel>Paris</SelectLabel>
                    {PARIS_DISTRICTS.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.nameFr}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>{t('location.nearbyCities')}</SelectLabel>
                    {NEARBY_CITIES.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.nameFr}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </motion.div>
          )}
        </div>

        {/* Games list */}
        <div className="flex-1 overflow-y-auto mt-4 -mx-6 px-6 space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40 w-full rounded-lg" />
              ))}
            </div>
          ) : games.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg mb-2">{t('matching.noGamesFound')}</h3>
              <p className="text-muted-foreground text-sm max-w-xs">
                {hasActiveFilters 
                  ? t('matching.tryBroaderFilters')
                  : t('matching.noGamesDesc')}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
                  {t('common.clearFilters')}
                </Button>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {t('matching.gamesFound', { count: games.length })}
              </p>
              {games.map((game, index) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <AvailableGameCard 
                    game={game} 
                    onExpressInterest={handleExpressInterest}
                  />
                </motion.div>
              ))}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
