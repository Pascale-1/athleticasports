import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface EventTemplate {
  id: string;
  team_id: string | null;
  user_id: string;
  name: string;
  type: "training" | "match" | "meetup";
  title: string;
  description: string | null;
  location: string | null;
  default_time: string | null;
  default_duration: number | null;
  default_day_of_week: number | null;
  max_participants: number | null;
  is_public: boolean;
  match_format: string | null;
  meetup_category: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTemplateData {
  name: string;
  type: "training" | "match" | "meetup";
  title: string;
  team_id?: string | null;
  description?: string | null;
  location?: string | null;
  default_time?: string | null;
  default_duration?: number | null;
  default_day_of_week?: number | null;
  max_participants?: number | null;
  is_public?: boolean;
  match_format?: string | null;
  meetup_category?: string | null;
}

// Pre-defined templates
export const PRESET_TEMPLATES: Omit<CreateTemplateData, "name">[] = [
  {
    type: "training",
    title: "Weekly Training",
    default_time: "19:00",
    default_duration: 90,
    default_day_of_week: 2, // Tuesday
  },
  {
    type: "match",
    title: "Home Game",
    default_time: "15:00",
    default_duration: 120,
    default_day_of_week: 6, // Saturday
  },
  {
    type: "meetup",
    title: "Watch Party",
    meetup_category: "watch_party",
    default_time: "20:00",
    default_duration: 180,
    is_public: true,
  },
  {
    type: "meetup",
    title: "Post-Game Drinks",
    meetup_category: "post_game",
    default_time: "18:00",
    default_duration: 120,
  },
];

export const useEventTemplates = (teamId?: string | null) => {
  const [templates, setTemplates] = useState<EventTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTemplates = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      let query = supabase
        .from("event_templates" as any)
        .select("*")
        .order("created_at", { ascending: false });

      // Get user's personal templates and team templates
      if (teamId) {
        query = query.or(`user_id.eq.${user.id},team_id.eq.${teamId}`);
      } else {
        query = query.eq("user_id", user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTemplates((data || []) as unknown as EventTemplate[]);
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const createTemplate = async (data: CreateTemplateData): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("event_templates" as any).insert({
        ...data,
        user_id: user.id,
      });

      if (error) throw error;

      toast({
        title: "Template saved",
        description: "Your event template has been saved.",
      });

      await fetchTemplates();
      return true;
    } catch (error: any) {
      console.error("Error creating template:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save template",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteTemplate = async (templateId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("event_templates" as any)
        .delete()
        .eq("id", templateId);

      if (error) throw error;

      toast({
        title: "Template deleted",
        description: "Your event template has been deleted.",
      });

      await fetchTemplates();
      return true;
    } catch (error: any) {
      console.error("Error deleting template:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete template",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    templates,
    loading,
    createTemplate,
    deleteTemplate,
    refetch: fetchTemplates,
  };
};
