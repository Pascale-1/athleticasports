import { useState, useMemo } from "react";
import { Team } from "@/lib/teams";

export const useTeamFilters = (teams: Team[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSport, setActiveSport] = useState("All");

  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      // Filter by sport
      if (activeSport !== "All" && team.sport !== activeSport) {
        return false;
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          team.name.toLowerCase().includes(query) ||
          team.description?.toLowerCase().includes(query) ||
          team.sport?.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [teams, searchQuery, activeSport]);

  return {
    searchQuery,
    setSearchQuery,
    activeSport,
    setActiveSport,
    filteredTeams,
  };
};
