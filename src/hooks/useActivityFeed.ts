import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

export interface Activity {
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
  actionIcon?: 'users' | 'user-plus' | 'calendar' | 'check' | 'activity';
}

export const useActivityFeed = (userId?: string) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);

        // Get current user if not provided
        let currentUserId = userId;
        if (!currentUserId) {
          const { data: { user } } = await supabase.auth.getUser();
          currentUserId = user?.id;
        }

        if (!currentUserId) {
          setActivities([]);
          return;
        }

        // Fetch from user_activity_log table
        const { data: activityLogs, error: logsError } = await supabase
          .from('user_activity_log')
          .select(`
            id,
            action_type,
            entity_id,
            entity_type,
            metadata,
            created_at,
            profiles:user_id (
              username,
              display_name,
              avatar_url
            )
          `)
          .order('created_at', { ascending: false })
          .limit(30);

        if (logsError) throw logsError;

        // Transform activity logs to unified Activity format
        const transformedActivities: Activity[] = (activityLogs || []).map((log: any) => {
          const profile = log.profiles;
          const timeAgo = formatDistanceToNow(new Date(log.created_at), { addSuffix: true });
          
          let description = '';
          let activityType = '';
          let actionIcon: Activity['actionIcon'] = 'activity';
          
          switch (log.action_type) {
            case 'team_created':
              activityType = 'Created Team';
              description = `Created "${log.metadata.team_name}"`;
              actionIcon = 'users';
              break;
            case 'team_joined':
              activityType = 'Joined Team';
              description = `Joined "${log.metadata.team_name}"`;
              actionIcon = 'user-plus';
              break;
            case 'event_created':
              activityType = 'Created Event';
              const eventTypeEmoji = log.metadata.event_type === 'training' ? '🏋️' : 
                                    log.metadata.event_type === 'match' ? '⚽' : '👥';
              description = `${eventTypeEmoji} ${log.metadata.event_title}`;
              actionIcon = 'calendar';
              break;
            case 'event_rsvp':
              activityType = 'RSVP';
              description = `Attending "${log.metadata.event_title}"`;
              actionIcon = 'check';
              break;
            case 'activity_logged':
              activityType = log.metadata.activity_type || 'Activity';
              const distanceStr = log.metadata.distance ? ` - ${log.metadata.distance}km` : '';
              const durationStr = log.metadata.duration ? ` • ${Math.round(log.metadata.duration / 60)}min` : '';
              description = `${log.metadata.title}${distanceStr}${durationStr}`;
              actionIcon = 'activity';
              break;
            default:
              activityType = 'Activity';
              description = 'Logged an activity';
          }
          
          return {
            id: log.id,
            username: profile?.username || 'Unknown',
            displayName: profile?.display_name,
            avatarUrl: profile?.avatar_url,
            activityType,
            timeAgo,
            description,
            likes: 0,
            comments: 0,
            createdAt: log.created_at,
            actionIcon,
          };
        });

        setActivities(transformedActivities);
      } catch (err) {
        console.error('Error fetching activity feed:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();

    // Set up realtime subscription
    const channel = supabase
      .channel('activity-feed')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_activity_log',
        },
        () => {
          fetchActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { activities, loading, error };
};
