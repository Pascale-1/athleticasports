import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { calculateMatchScore, MatchScore } from "@/lib/matchingScore";

export interface AvailableGame {
  id: string;
  title: string;
  sport: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  location_district: string | null;
  max_participants: number | null;
  players_needed: number | null;
  skill_level_min: number | null;
  skill_level_max: number | null;
  created_by: string;
  matchScore?: MatchScore;
  spotsLeft?: number;
  attendingCount?: number;
  organizerName?: string;
  organizerAvatar?: string;
}

export interface AvailableGamesFilters {
  sport?: string;
  district?: string;
  dateFrom?: Date;
  dateTo?: Date;
  skillLevel?: number;
}

export const useAvailableGames = (filters?: AvailableGamesFilters) => {
  const [games, setGames] = useState<AvailableGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [userAvailability, setUserAvailability] = useState<{
    sport: string;
    available_from: string;
    available_until: string;
    location_district?: string | null;
    skill_level?: number | null;
  } | null>(null);

  const fetchGames = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get current user's availability for scoring (if any)
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: availability } = await supabase
          .from("player_availability")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .gte("expires_at", new Date().toISOString())
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        
        setUserAvailability(availability);
      }

      // Build query for games looking for players
      let query = supabase
        .from("events")
        .select(`
          *,
          event_attendance(user_id, status)
        `)
        .eq("looking_for_players", true)
        .gte("start_time", new Date().toISOString())
        .order("start_time", { ascending: true });

      // Apply filters
      if (filters?.sport) {
        query = query.eq("sport", filters.sport);
      }
      if (filters?.district) {
        query = query.eq("location_district", filters.district);
      }
      if (filters?.dateFrom) {
        query = query.gte("start_time", filters.dateFrom.toISOString());
      }
      if (filters?.dateTo) {
        query = query.lte("start_time", filters.dateTo.toISOString());
      }

      const { data: events, error } = await query.limit(50);

      if (error) throw error;

      // Get organizer profiles
      const organizerIds = [...new Set((events || []).map(e => e.created_by))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, username, avatar_url")
        .in("user_id", organizerIds);

      const profileMap = new Map(
        (profiles || []).map(p => [p.user_id, p])
      );

      // Process games with scores
      const processedGames: AvailableGame[] = (events || []).map(event => {
        const attendance = event.event_attendance || [];
        const attendingCount = attendance.filter(
          (a: { status: string }) => a.status === "attending"
        ).length;
        
        const spotsLeft = event.players_needed 
          ? Math.max(0, event.players_needed - attendingCount)
          : event.max_participants 
            ? Math.max(0, event.max_participants - attendingCount)
            : undefined;

        const organizer = profileMap.get(event.created_by);
        
        // Calculate match score if user has availability
        let matchScore: MatchScore | undefined;
        if (userAvailability && event.sport) {
          matchScore = calculateMatchScore(userAvailability, {
            sport: event.sport,
            start_time: event.start_time,
            end_time: event.end_time,
            location_district: event.location_district,
            skill_level_min: event.skill_level_min,
            skill_level_max: event.skill_level_max,
          });
        }

        // Filter by skill level if specified
        if (filters?.skillLevel) {
          const min = event.skill_level_min || 1;
          const max = event.skill_level_max || 5;
          if (filters.skillLevel < min - 1 || filters.skillLevel > max + 1) {
            return null; // Filter out games too far from skill level
          }
        }

        return {
          ...event,
          matchScore,
          spotsLeft,
          attendingCount,
          organizerName: organizer?.display_name || organizer?.username,
          organizerAvatar: organizer?.avatar_url,
        };
      }).filter(Boolean) as AvailableGame[];

      // Sort by match score if available, otherwise by date
      processedGames.sort((a, b) => {
        if (a.matchScore && b.matchScore) {
          return b.matchScore.total - a.matchScore.total;
        }
        return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
      });

      setGames(processedGames);
    } catch (error) {
      console.error("Error fetching available games:", error);
    } finally {
      setLoading(false);
    }
  }, [filters?.sport, filters?.district, filters?.dateFrom?.toISOString(), filters?.dateTo?.toISOString(), filters?.skillLevel]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  return {
    games,
    loading,
    userAvailability,
    refetch: fetchGames,
  };
};
