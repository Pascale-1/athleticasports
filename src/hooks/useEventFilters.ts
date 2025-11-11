import { useState, useMemo } from "react";
import { Event } from "@/lib/events";
import { EventType } from "@/lib/eventConfig";
import {
  filterEventsByType,
  filterEventsByStatus,
  sortEventsByDate,
} from "@/lib/events";

export interface EventFilters {
  type: EventType | 'all';
  status: 'all' | 'upcoming' | 'past';
  searchQuery: string;
  teamId?: string | null;
  isPublic?: boolean;
  sortOrder: 'asc' | 'desc';
}

export const useEventFilters = (events: Event[]) => {
  const [filters, setFilters] = useState<EventFilters>({
    type: 'all',
    status: 'upcoming',
    searchQuery: '',
    sortOrder: 'asc',
  });

  const filteredEvents = useMemo(() => {
    let filtered = [...events];

    // Filter by type
    filtered = filterEventsByType(filtered, filters.type);

    // Filter by status
    filtered = filterEventsByStatus(filtered, filters.status);

    // Filter by team
    if (filters.teamId !== undefined) {
      if (filters.teamId === null) {
        filtered = filtered.filter(e => e.team_id === null);
      } else {
        filtered = filtered.filter(e => e.team_id === filters.teamId);
      }
    }

    // Filter by public/private
    if (filters.isPublic !== undefined) {
      filtered = filtered.filter(e => e.is_public === filters.isPublic);
    }

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        e =>
          e.title.toLowerCase().includes(query) ||
          e.description?.toLowerCase().includes(query) ||
          e.location?.toLowerCase().includes(query) ||
          e.opponent_name?.toLowerCase().includes(query) ||
          e.meetup_category?.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered = sortEventsByDate(filtered, filters.sortOrder);

    return filtered;
  }, [events, filters]);

  const updateFilter = <K extends keyof EventFilters>(
    key: K,
    value: EventFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      type: 'all',
      status: 'upcoming',
      searchQuery: '',
      sortOrder: 'asc',
    });
  };

  const setTypeFilter = (type: EventType | 'all') => updateFilter('type', type);
  const setStatusFilter = (status: 'all' | 'upcoming' | 'past') => updateFilter('status', status);
  const setSearchQuery = (query: string) => updateFilter('searchQuery', query);
  const setSortOrder = (order: 'asc' | 'desc') => updateFilter('sortOrder', order);
  const setTeamFilter = (teamId: string | null | undefined) => updateFilter('teamId', teamId);
  const setPublicFilter = (isPublic: boolean | undefined) => updateFilter('isPublic', isPublic);

  return {
    filters,
    filteredEvents,
    updateFilter,
    resetFilters,
    setTypeFilter,
    setStatusFilter,
    setSearchQuery,
    setSortOrder,
    setTeamFilter,
    setPublicFilter,
  };
};
