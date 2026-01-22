import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import i18n from '@/i18n';
import { useRealtimeSubscription } from '@/lib/realtimeManager';

export interface Activity {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  actionType: string; // Raw action type for translation in component
  timeAgo: string;
  metadata?: Record<string, any>; // Raw metadata for translation
  createdAt: string;
  actionIcon?: 'users' | 'user-plus' | 'calendar' | 'check' | 'activity';
}

export const useActivityFeed = (userId?: string) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastCursor, setLastCursor] = useState<string | null>(null);
  const PAGE_SIZE = 10;

  const transformActivityLog = (log: any): Activity => {
    const profile = log.profiles;
    const locale = i18n.language === 'fr' ? fr : enUS;
    const timeAgo = formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale });
    
    let actionIcon: Activity['actionIcon'] = 'activity';
    
    switch (log.action_type) {
      case 'team_created':
        actionIcon = 'users';
        break;
      case 'team_joined':
        actionIcon = 'user-plus';
        break;
      case 'event_created':
        actionIcon = 'calendar';
        break;
      case 'event_rsvp':
        actionIcon = 'check';
        break;
      case 'activity_logged':
        actionIcon = 'activity';
        break;
      default:
        actionIcon = 'activity';
    }
    
    return {
      id: log.id,
      username: profile?.username || 'Unknown',
      displayName: profile?.display_name,
      avatarUrl: profile?.avatar_url,
      actionType: log.action_type, // Pass raw action type
      timeAgo,
      metadata: log.metadata, // Pass raw metadata for translation in component
      createdAt: log.created_at,
      actionIcon,
    };
  };

  const fetchActivities = async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

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

      // Build query with pagination - fetch logs first, then profiles separately
      let query = supabase
        .from('user_activity_log')
        .select('id, action_type, entity_id, entity_type, metadata, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE + 1); // Fetch one extra to check if there's more

      // Apply cursor for pagination
      if (isLoadMore && lastCursor) {
        query = query.lt('created_at', lastCursor);
      }

      const { data: activityLogs, error: logsError } = await query;

      if (logsError) throw logsError;

      // Fetch profiles for all users in the activity logs
      const userIds = [...new Set((activityLogs || []).map(log => log.user_id))];
      let profilesMap: Record<string, { username: string; display_name: string | null; avatar_url: string | null }> = {};

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, username, display_name, avatar_url')
          .in('user_id', userIds);

        profilesMap = (profiles || []).reduce((acc, p) => {
          acc[p.user_id] = p;
          return acc;
        }, {} as typeof profilesMap);
      }

      // Attach profiles to logs
      const logsWithProfiles = (activityLogs || []).map(log => ({
        ...log,
        profiles: profilesMap[log.user_id] || null
      }));

      // Check if there's more data
      const hasMoreData = logsWithProfiles.length > PAGE_SIZE;
      setHasMore(hasMoreData);

      // Take only PAGE_SIZE items
      const logsToProcess = logsWithProfiles.slice(0, PAGE_SIZE);
      
      // Update cursor for next page
      if (logsToProcess.length > 0) {
        setLastCursor(logsToProcess[logsToProcess.length - 1].created_at);
      }

      // Transform activity logs
      const transformedActivities = logsToProcess.map(transformActivityLog);

      if (isLoadMore) {
        setActivities(prev => [...prev, ...transformedActivities]);
      } else {
        setActivities(transformedActivities);
      }
    } catch (err) {
      console.error('Error fetching activity feed:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    // Reset pagination when userId changes
    setLastCursor(null);
    setActivities([]);
    fetchActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Use ref to store fetchActivities for stable callback
  const fetchActivitiesRef = useRef(fetchActivities);
  fetchActivitiesRef.current = fetchActivities;

  // Realtime subscription using centralized manager
  const handleRealtimeChange = useCallback(() => {
    // Reset and refetch on new activity
    setLastCursor(null);
    fetchActivitiesRef.current();
  }, []);

  useRealtimeSubscription(
    'activity-feed',
    [{ table: 'user_activity_log', event: '*' }],
    handleRealtimeChange,
    true
  );

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchActivities(true);
    }
  };

  return { activities, loading, loadingMore, error, hasMore, loadMore };
};
