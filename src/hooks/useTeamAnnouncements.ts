import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TeamAnnouncement {
  id: string;
  team_id: string;
  posted_by: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  profile?: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export const useTeamAnnouncements = (teamId: string | null) => {
  const [announcements, setAnnouncements] = useState<TeamAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!teamId) {
      setLoading(false);
      return;
    }

    const fetchAnnouncements = async () => {
      try {
        const { data, error } = await supabase
          .from("team_announcements")
          .select(`
            *,
            profiles:posted_by (
              username,
              display_name,
              avatar_url
            )
          `)
          .eq("team_id", teamId)
          .order("is_pinned", { ascending: false })
          .order("created_at", { ascending: false });

        if (error) throw error;
        
        const formattedData = data.map(item => ({
          ...item,
          profile: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles
        }));
        
        setAnnouncements(formattedData as TeamAnnouncement[]);
      } catch (error) {
        console.error("Error fetching announcements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();

    const channel = supabase
      .channel(`team-announcements-${teamId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "team_announcements",
          filter: `team_id=eq.${teamId}`,
        },
        () => {
          fetchAnnouncements();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId]);

  const createAnnouncement = async (content: string) => {
    if (!teamId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("team_announcements").insert({
        team_id: teamId,
        posted_by: user.id,
        content,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Announcement posted",
      });
    } catch (error: any) {
      console.error("Error creating announcement:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to post announcement",
        variant: "destructive",
      });
    }
  };

  const togglePin = async (announcementId: string, isPinned: boolean) => {
    try {
      const { error } = await supabase
        .from("team_announcements")
        .update({ is_pinned: !isPinned })
        .eq("id", announcementId);

      if (error) throw error;
    } catch (error) {
      console.error("Error toggling pin:", error);
      toast({
        title: "Error",
        description: "Failed to update announcement",
        variant: "destructive",
      });
    }
  };

  const deleteAnnouncement = async (announcementId: string) => {
    try {
      // Optimistic update
      setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
      
      const { error } = await supabase
        .from("team_announcements")
        .delete()
        .eq("id", announcementId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Announcement deleted",
      });
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive",
      });
      // Refetch on error to restore correct state
      if (teamId) {
        const { data } = await supabase
          .from("team_announcements")
          .select(`
            *,
            profiles:posted_by (
              username,
              display_name,
              avatar_url
            )
          `)
          .eq("team_id", teamId)
          .order("is_pinned", { ascending: false })
          .order("created_at", { ascending: false });
        
        if (data) {
          const formattedData = data.map(item => ({
            ...item,
            profile: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles
          }));
          setAnnouncements(formattedData as TeamAnnouncement[]);
        }
      }
    }
  };

  return {
    announcements,
    loading,
    createAnnouncement,
    togglePin,
    deleteAnnouncement,
  };
};
