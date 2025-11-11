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
        
        // Fetch real activities from team members and followed users
        const { data: activities, error: activitiesError } = await supabase
          .from('activities')
          .select(`
            id,
            type,
            title,
            description,
            distance,
            duration,
            calories,
            created_at,
            user_id,
            visibility,
            profiles:user_id (
              username,
              display_name,
              avatar_url,
              primary_sport
            )
          `)
          .in('visibility', ['team', 'public'])
          .order('created_at', { ascending: false })
          .limit(20);

        if (activitiesError) throw activitiesError;

        // Transform to Activity format
        const transformedActivities: Activity[] = (activities || []).map((activity: any) => {
          const profile = activity.profiles;
          const now = new Date();
          const activityDate = new Date(activity.created_at);
          const diffMs = now.getTime() - activityDate.getTime();
          const diffMins = Math.floor(diffMs / 60000);
          const diffHours = Math.floor(diffMins / 60);
          const diffDays = Math.floor(diffHours / 24);
          
          let timeAgo: string;
          if (diffMins < 1) {
            timeAgo = "Just now";
          } else if (diffMins < 60) {
            timeAgo = `${diffMins}m ago`;
          } else if (diffHours < 24) {
            timeAgo = `${diffHours}h ago`;
          } else {
            timeAgo = `${diffDays}d ago`;
          }

          return {
            id: activity.id,
            username: profile?.username || 'Unknown',
            displayName: profile?.display_name,
            avatarUrl: profile?.avatar_url,
            activityType: activity.type.charAt(0).toUpperCase() + activity.type.slice(1),
            timeAgo,
            description: activity.description || `${activity.title}${activity.distance ? ` - ${activity.distance}km` : ''}${activity.duration ? ` - ${activity.duration}min` : ''}`,
            likes: 0,
            comments: 0,
            createdAt: activity.created_at,
          };
        });

        setActivities(transformedActivities);
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
