import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Activity {
  id: string;
  user_id: string;
  type: "run" | "cycle" | "workout" | "swim" | "walk" | "other";
  title: string;
  description?: string;
  distance?: number;
  duration?: number;
  calories?: number;
  date: string;
  created_at: string;
  updated_at: string;
}

export const useActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();

    const channel = supabase
      .channel('activities-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities'
        },
        () => {
          fetchActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchActivities = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setActivities((data as any) || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const createActivity = async (activity: Omit<Activity, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('activities')
        .insert([{ ...activity, user_id: user.id }]);

      if (error) throw error;
      toast.success('Activity logged successfully');
      await fetchActivities();
    } catch (error) {
      console.error('Error creating activity:', error);
      toast.error('Failed to log activity');
    }
  };

  const updateActivity = async (id: string, updates: Partial<Activity>) => {
    try {
      const { error } = await supabase
        .from('activities')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      toast.success('Activity updated');
      await fetchActivities();
    } catch (error) {
      console.error('Error updating activity:', error);
      toast.error('Failed to update activity');
    }
  };

  const deleteActivity = async (id: string) => {
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Activity deleted');
      await fetchActivities();
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast.error('Failed to delete activity');
    }
  };

  const getStats = () => {
    const totalDistance = activities.reduce((sum, a) => sum + (a.distance || 0), 0);
    const totalDuration = activities.reduce((sum, a) => sum + (a.duration || 0), 0);
    const totalCalories = activities.reduce((sum, a) => sum + (a.calories || 0), 0);

    return {
      totalActivities: activities.length,
      totalDistance,
      totalDuration,
      totalCalories,
    };
  };

  return {
    activities,
    loading,
    createActivity,
    updateActivity,
    deleteActivity,
    getStats,
    refresh: fetchActivities,
  };
};
