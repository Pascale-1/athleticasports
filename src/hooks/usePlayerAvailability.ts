import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface PlayerAvailability {
  id: string;
  user_id: string;
  sport: string;
  available_from: string;
  available_until: string;
  location: string | null;
  location_district: string | null;
  skill_level: number | null;
  is_active: boolean;
  created_at: string;
  expires_at: string;
}

export interface CreateAvailabilityData {
  sport: string;
  available_from: string;
  available_until: string;
  location_district?: string;
  skill_level?: number;
}

export const usePlayerAvailability = () => {
  const [availability, setAvailability] = useState<PlayerAvailability | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMyAvailability();
  }, []);

  const fetchMyAvailability = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("player_availability")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .gte("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setAvailability(data);
    } catch (error) {
      console.error("Error fetching availability:", error);
    } finally {
      setLoading(false);
    }
  };

  const createAvailability = async (data: CreateAvailabilityData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Deactivate any existing availability
      await supabase
        .from("player_availability")
        .update({ is_active: false })
        .eq("user_id", user.id)
        .eq("is_active", true);

      const { data: newAvailability, error } = await supabase
        .from("player_availability")
        .insert({
          user_id: user.id,
          sport: data.sport,
          available_from: data.available_from,
          available_until: data.available_until,
          location_district: data.location_district || null,
          skill_level: data.skill_level || null,
        })
        .select()
        .single();

      if (error) throw error;

      setAvailability(newAvailability);

      // Trigger matching
      try {
        await supabase.functions.invoke("match-players", {
          body: { availability_id: newAvailability.id },
        });
      } catch (matchError) {
        console.log("Matching will run in background");
      }

      toast({
        title: "You're now available!",
        description: "We'll notify you when we find a match.",
      });

      return newAvailability;
    } catch (error: any) {
      console.error("Error creating availability:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to set availability",
        variant: "destructive",
      });
      return null;
    }
  };

  const cancelAvailability = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("player_availability")
        .update({ is_active: false })
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (error) throw error;

      setAvailability(null);
      toast({
        title: "Availability cancelled",
        description: "You're no longer looking for matches.",
      });

      return true;
    } catch (error: any) {
      console.error("Error cancelling availability:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to cancel availability",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    availability,
    loading,
    createAvailability,
    cancelAvailability,
    refetch: fetchMyAvailability,
  };
};
