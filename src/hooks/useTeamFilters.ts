import { useState, useMemo } from "react";
import { Team } from "@/lib/teams";
import { getSportById } from "@/lib/sports";

export const useTeamFilters = (teams: Team[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSport, setActiveSport] = useState("All");

  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      // Filter by sport (case-insensitive, matches by ID or label)
      if (activeSport !== "All") {
        const teamSportLower = team.sport?.toLowerCase();
        const sport = getSportById(activeSport);
        
        const matchesFilter = 
          teamSportLower === activeSport.toLowerCase() ||
          teamSportLower === sport?.label.en.toLowerCase() ||
          teamSportLower === sport?.label.fr.toLowerCase();
        
        if (!matchesFilter) {
          return false;
        }
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
