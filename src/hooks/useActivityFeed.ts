import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Activity {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  activityType: string;
  timeAgo: string;
  description?: string;
  achievements?: string[];
  likes?: number;
  comments?: number;
  imageUrl?: string;
  createdAt: string;
}

export const useActivityFeed = (userId?: string) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        
        // For now, we'll create mock activities based on actual user data
        // In a real implementation, you'd have an activities table
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .limit(10);

        if (profilesError) throw profilesError;

        // Mock activities from profiles
        const mockActivities: Activity[] = (profiles || []).map((profile, index) => ({
          id: profile.id,
          username: profile.username,
          displayName: profile.display_name || undefined,
          avatarUrl: profile.avatar_url || undefined,
          activityType: profile.primary_sport || "Training Session",
          timeAgo: index === 0 ? "Just now" : index === 1 ? "2 hours ago" : `${index} days ago`,
          description: `Completed an amazing ${profile.primary_sport || "training"} session today! Feeling stronger every day 💪`,
          achievements: index % 3 === 0 ? ["Personal Best", "5km Streak"] : undefined,
          likes: Math.floor(Math.random() * 50) + 5,
          comments: Math.floor(Math.random() * 10),
          createdAt: new Date(Date.now() - index * 86400000).toISOString(),
        }));

        setActivities(mockActivities);
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch activities');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [userId]);

  return { activities, loading, error };
};
