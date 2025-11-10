import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface PerformanceLevel {
  id: string;
  team_id: string;
  user_id: string;
  level: number;
  assigned_by: string;
  assigned_at: string;
  notes: string | null;
}

export interface LevelStats {
  level1: number;
  level2: number;
  level3: number;
  level4: number;
  unassigned: number;
  total: number;
}

export const usePerformanceLevels = (teamId: string | null) => {
  const [levels, setLevels] = useState<PerformanceLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!teamId) {
      setLoading(false);
      return;
    }

    const fetchLevels = async () => {
      try {
        const { data, error } = await supabase
          .from("player_performance_levels")
          .select("*")
          .eq("team_id", teamId);

        if (error) throw error;
        setLevels(data || []);
      } catch (error) {
        console.error("Error fetching performance levels:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLevels();

    const channel = supabase
      .channel(`performance-levels-${teamId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "player_performance_levels",
          filter: `team_id=eq.${teamId}`,
        },
        () => {
          fetchLevels();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId]);

  const assignLevel = async (
    userId: string,
    level: number,
    notes?: string
  ) => {
    if (!teamId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("player_performance_levels")
        .upsert({
          team_id: teamId,
          user_id: userId,
          level,
          assigned_by: user.id,
          notes: notes || null,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Performance level ${level} assigned`,
      });
    } catch (error: any) {
      console.error("Error assigning level:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign performance level",
        variant: "destructive",
      });
    }
  };

  const removeLevel = async (userId: string) => {
    if (!teamId) return;

    try {
      const { error } = await supabase
        .from("player_performance_levels")
        .delete()
        .eq("team_id", teamId)
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Performance level removed",
      });
    } catch (error: any) {
      console.error("Error removing level:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove performance level",
        variant: "destructive",
      });
    }
  };

  const getLevelForUser = (userId: string): number | null => {
    const level = levels.find(l => l.user_id === userId);
    return level ? level.level : null;
  };

  const getLevelStats = (totalMembers: number): LevelStats => {
    const stats = {
      level1: 0,
      level2: 0,
      level3: 0,
      level4: 0,
      unassigned: 0,
      total: totalMembers,
    };

    levels.forEach(level => {
      switch (level.level) {
        case 1:
          stats.level1++;
          break;
        case 2:
          stats.level2++;
          break;
        case 3:
          stats.level3++;
          break;
        case 4:
          stats.level4++;
          break;
      }
    });

    stats.unassigned = totalMembers - levels.length;
    return stats;
  };

  return {
    levels,
    loading,
    assignLevel,
    removeLevel,
    getLevelForUser,
    getLevelStats,
  };
};
