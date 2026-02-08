import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarCheck, Users, ChevronRight, Clock, Trophy, Dumbbell, Coffee } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserEvents } from "@/hooks/useUserEvents";
import { formatDateTimeShort } from "@/lib/dateUtils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Team {
  id: string;
  name: string;
  sport: string | null;
  avatar_url: string | null;
}

const eventTypeIcon = (type: string) => {
  switch (type) {
    case 'match': return Trophy;
    case 'training': return Dumbbell;
    case 'meetup': return Coffee;
    default: return CalendarCheck;
  }
};

export const ProfileActivityTab = ({ userId }: { userId: string }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [upcomingOpen, setUpcomingOpen] = useState(true);
  const [teamsOpen, setTeamsOpen] = useState(true);
  const [pastOpen, setPastOpen] = useState(true);

  const { events: upcomingEvents, loading: upcomingLoading } = useUserEvents({ status: 'upcoming' });
  const { events: pastEvents, loading: pastLoading } = useUserEvents({ status: 'past' });

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const { data, error } = await supabase
          .from("team_members")
          .select("team_id, teams(id, name, sport, avatar_url)")
          .eq("user_id", userId)
          .eq("status", "active");

        if (error) throw error;

        const teamsList = (data || [])
          .map((tm: any) => tm.teams)
          .filter(Boolean) as Team[];
        setTeams(teamsList);
      } catch (err) {
        console.error("Error fetching teams:", err);
      } finally {
        setTeamsLoading(false);
      }
    };

    if (userId) fetchTeams();
  }, [userId]);

  const displayUpcoming = upcomingEvents.slice(0, 3);
  const displayPast = pastEvents.slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Upcoming Events */}
      <Card>
        <Collapsible open={upcomingOpen} onOpenChange={setUpcomingOpen}>
          <CollapsibleTrigger asChild>
            <CardContent className="pt-5 pb-3 cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">{t('profile.upcomingEvents')}</h3>
                  {!upcomingLoading && (
                    <Badge variant="secondary" className="text-[10px]">
                      {upcomingEvents.length}
                    </Badge>
                  )}
                </div>
                <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${upcomingOpen ? 'rotate-90' : ''}`} />
              </div>
            </CardContent>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 pb-4">
              {upcomingLoading ? (
                <div className="space-y-2">
                  {[1, 2].map(i => <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />)}
                </div>
              ) : displayUpcoming.length > 0 ? (
                <div className="space-y-2">
                  {displayUpcoming.map(event => {
                    const Icon = eventTypeIcon(event.type);
                    return (
                      <div
                        key={event.id}
                        onClick={() => navigate(`/events/${event.id}`)}
                        className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors active:scale-[0.99]"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{event.title}</p>
                          <p className="text-xs text-muted-foreground">{formatDateTimeShort(event.start_time)}</p>
                        </div>
                        {event.userStatus && (
                          <Badge variant="outline" className="text-[10px] shrink-0">
                            {event.userStatus === 'attending' ? t('status.going') : t('status.maybe')}
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                  {upcomingEvents.length > 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-muted-foreground"
                      onClick={() => navigate("/events?tab=my")}
                    >
                      {t('actions.viewAll')} ({upcomingEvents.length})
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-3">
                  {t('profile.noUpcomingEvents')}
                </p>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* My Teams */}
      <Card>
        <Collapsible open={teamsOpen} onOpenChange={setTeamsOpen}>
          <CollapsibleTrigger asChild>
            <CardContent className="pt-5 pb-3 cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">{t('profile.myTeams')}</h3>
                  {!teamsLoading && (
                    <Badge variant="secondary" className="text-[10px]">
                      {teams.length}
                    </Badge>
                  )}
                </div>
                <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${teamsOpen ? 'rotate-90' : ''}`} />
              </div>
            </CardContent>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 pb-4">
              {teamsLoading ? (
                <div className="space-y-2">
                  {[1, 2].map(i => <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />)}
                </div>
              ) : teams.length > 0 ? (
                <div className="space-y-2">
                  {teams.map(team => (
                    <div
                      key={team.id}
                      onClick={() => navigate(`/teams/${team.id}`)}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors active:scale-[0.99]"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={team.avatar_url || undefined} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {team.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{team.name}</p>
                      </div>
                      {team.sport && (
                        <Badge variant="secondary" className="text-[10px] shrink-0">
                          {t(`sports.${team.sport}`, team.sport)}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-3">
                  {t('profile.noTeams')}
                </p>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Past Events */}
      <Card>
        <Collapsible open={pastOpen} onOpenChange={setPastOpen}>
          <CollapsibleTrigger asChild>
            <CardContent className="pt-5 pb-3 cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm">{t('profile.pastEvents')}</h3>
                  {!pastLoading && (
                    <Badge variant="secondary" className="text-[10px]">
                      {pastEvents.length}
                    </Badge>
                  )}
                </div>
                <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${pastOpen ? 'rotate-90' : ''}`} />
              </div>
            </CardContent>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 pb-4">
              {pastLoading ? (
                <div className="space-y-2">
                  {[1, 2].map(i => <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />)}
                </div>
              ) : displayPast.length > 0 ? (
                <div className="space-y-2">
                  {displayPast.map(event => {
                    const Icon = eventTypeIcon(event.type);
                    return (
                      <div
                        key={event.id}
                        onClick={() => navigate(`/events/${event.id}`)}
                        className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors active:scale-[0.99]"
                      >
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{event.title}</p>
                          <p className="text-xs text-muted-foreground">{formatDateTimeShort(event.start_time)}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] shrink-0 capitalize">
                          {t(`events:types.${event.type}`, event.type)}
                        </Badge>
                      </div>
                    );
                  })}
                  {pastEvents.length > 5 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-muted-foreground"
                      onClick={() => navigate("/events?tab=my&status=past")}
                    >
                      {t('actions.viewAll')} ({pastEvents.length})
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-3">
                  {t('profile.noPastEvents')}
                </p>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
};
