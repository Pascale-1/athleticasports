import { useState, useCallback } from "react";

export const useSportFilter = () => {
  const [selectedSport, setSelectedSport] = useState("All");

  const handleSportChange = useCallback((sport: string) => {
    setSelectedSport(sport);
  }, []);

  const resetSport = useCallback(() => {
    setSelectedSport("All");
  }, []);

  return {
    selectedSport,
    setSelectedSport: handleSportChange,
    resetSport,
  };
};
