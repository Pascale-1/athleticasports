import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";

interface EventFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  typeFilter: string;
  onTypeChange: (type: string) => void;
  statusFilter: 'upcoming' | 'past' | 'all';
  onStatusChange: (status: 'upcoming' | 'past' | 'all') => void;
  showPublicFilter?: boolean;
  publicFilter?: boolean;
  onPublicFilterChange?: (isPublic: boolean | undefined) => void;
}

export const EventFilters = ({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeChange,
  statusFilter,
  onStatusChange,
  showPublicFilter = false,
  publicFilter,
  onPublicFilterChange,
}: EventFiltersProps) => {
  const hasActiveFilters = searchQuery || typeFilter !== 'all' || statusFilter !== 'upcoming' || publicFilter !== undefined;

  const clearFilters = () => {
    onSearchChange('');
    onTypeChange('all');
    onStatusChange('upcoming');
    if (onPublicFilterChange) onPublicFilterChange(undefined);
  };

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-9"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            onClick={() => onSearchChange('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Quick Filters - Desktop */}
      <Card className="hidden sm:block p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground">Filter by:</span>
          
          <Select value={typeFilter} onValueChange={onTypeChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="training">Training</SelectItem>
              <SelectItem value="meetup">Meetup</SelectItem>
              <SelectItem value="match">Match</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="past">Past</SelectItem>
              <SelectItem value="all">All Events</SelectItem>
            </SelectContent>
          </Select>

          {showPublicFilter && onPublicFilterChange && (
            <Select
              value={publicFilter === undefined ? 'all' : publicFilter ? 'public' : 'private'}
              onValueChange={(val) => {
                if (val === 'all') onPublicFilterChange(undefined);
                else onPublicFilterChange(val === 'public');
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Team Only</SelectItem>
              </SelectContent>
            </Select>
          )}

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </Card>

      {/* Mobile Filter Sheet */}
      <div className="sm:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 h-2 w-2 rounded-full bg-primary" />
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[400px]">
            <SheetHeader>
              <SheetTitle>Filter Events</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 mt-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Event Type</label>
                <Select value={typeFilter} onValueChange={onTypeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="meetup">Meetup</SelectItem>
                    <SelectItem value="match">Match</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={statusFilter} onValueChange={onStatusChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="past">Past</SelectItem>
                    <SelectItem value="all">All Events</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {showPublicFilter && onPublicFilterChange && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Visibility</label>
                  <Select
                    value={publicFilter === undefined ? 'all' : publicFilter ? 'public' : 'private'}
                    onValueChange={(val) => {
                      if (val === 'all') onPublicFilterChange(undefined);
                      else onPublicFilterChange(val === 'public');
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Events</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Team Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {hasActiveFilters && (
                <Button variant="outline" className="w-full" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};
