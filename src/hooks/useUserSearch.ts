import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SearchedUser {
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

export const useUserSearch = (query: string, teamId: string | null) => {
  const [users, setUsers] = useState<SearchedUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim() || query.length < 2 || !teamId) {
      setUsers([]);
      return;
    }

    const searchUsers = async () => {
      setLoading(true);
      try {
        // Get current team members to exclude them
        const { data: teamMembers } = await supabase
          .from("team_members")
          .select("user_id")
          .eq("team_id", teamId)
          .eq("status", "active");

        const excludedUserIds = teamMembers?.map(m => m.user_id) || [];

        // Sanitize query to prevent SQL injection
        const sanitizedQuery = query.replace(/[%_]/g, '\\$&')
        
        // Search for users by username or display name
        const { data, error } = await supabase
          .from("profiles")
          .select("user_id, username, display_name, avatar_url")
          .or(`username.ilike.%${sanitizedQuery}%,display_name.ilike.%${sanitizedQuery}%`)
          .limit(5);

        if (error) throw error;

        // Filter out existing team members
        const filteredUsers = data?.filter(
          user => !excludedUserIds.includes(user.user_id)
        ) || [];

        setUsers(filteredUsers);
      } catch (error) {
        console.error("Error searching users:", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [query, teamId]);

  return { users, loading };
};
