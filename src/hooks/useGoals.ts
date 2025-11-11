import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  goal_type: "distance" | "duration" | "frequency" | "custom";
  target_value?: number;
  current_value: number;
  unit?: string;
  start_date: string;
  end_date?: string;
  status: "active" | "completed" | "abandoned";
  created_at: string;
  updated_at: string;
}

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoals();

    const channel = supabase
      .channel('goals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_goals'
        },
        () => {
          fetchGoals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchGoals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals((data as any) || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (goal: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'current_value' | 'status'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_goals')
        .insert([{ ...goal, user_id: user.id, current_value: 0, status: 'active' }]);

      if (error) throw error;
      toast.success('Goal created successfully');
      await fetchGoals();
    } catch (error) {
      console.error('Error creating goal:', error);
      toast.error('Failed to create goal');
    }
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    try {
      const { error } = await supabase
        .from('user_goals')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      toast.success('Goal updated');
      await fetchGoals();
    } catch (error) {
      console.error('Error updating goal:', error);
      toast.error('Failed to update goal');
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_goals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Goal deleted');
      await fetchGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    }
  };

  const updateProgress = async (id: string, newValue: number) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;

    const status = goal.target_value && newValue >= goal.target_value ? 'completed' : 'active';
    await updateGoal(id, { current_value: newValue, status });
  };

  return {
    goals,
    loading,
    createGoal,
    updateGoal,
    deleteGoal,
    updateProgress,
    refresh: fetchGoals,
  };
};
