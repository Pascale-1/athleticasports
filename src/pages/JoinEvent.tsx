import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageContainer } from "@/components/mobile/PageContainer";
import { Calendar, MapPin, Loader2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatEventDateRange, getEventStatus } from "@/lib/events";
import { EVENT_CONFIG, getEventTypeKey } from "@/lib/eventConfig";

const JoinEvent = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [event, setEvent] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthAndFetchEvent();
  }, [code]);

  const checkAuthAndFetchEvent = async () => {
    try {
      // Check authentication
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);

      // Fetch event by invite code
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("invite_code", code?.toUpperCase())
        .single();

      if (eventError) throw new Error("Invalid or expired invite code");
      if (!eventData.allow_public_join) throw new Error("This event is no longer accepting joins");

      setEvent(eventData);
    } catch (error: any) {
      toast({
        title: t('status.error', { ns: 'common' }),
        description: error.message,
        variant: "destructive",
      });
      setTimeout(() => navigate("/events"), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = async () => {
    if (!isAuthenticated) {
      // Redirect to auth with return URL
      navigate(`/auth?returnUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setJoining(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Auto-RSVP as "attending"
      const { error } = await supabase
        .from("event_attendance")
        .upsert({
          event_id: event.id,
          user_id: user.id,
          status: 'attending',
        }, {
          onConflict: 'event_id,user_id'
        });

      if (error) throw error;

      toast({
        title: t('status.success', { ns: 'common' }),
        description: t('rsvp.attending', { ns: 'events' }) + ` ${event.title}`,
      });

      // Redirect to event detail page
      navigate(`/events/${event.id}`);
    } catch (error: any) {
      toast({
        title: t('status.error', { ns: 'common' }),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageContainer>
    );
  }

  if (!event) return null;

  const eventConfig = EVENT_CONFIG[event.type];
  const EventIcon = eventConfig.icon;
  const status = getEventStatus(event);

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" style={{ backgroundColor: eventConfig.bgColor, color: eventConfig.color }}>
                <EventIcon className="h-3 w-3 mr-1" />
                {t(`events:types.${getEventTypeKey(event.type)}`)}
              </Badge>
              <Badge variant={status === 'upcoming' ? 'default' : 'secondary'}>
                {status}
              </Badge>
            </div>
            <CardTitle className="text-2xl">{event.title}</CardTitle>
            {event.description && (
              <CardDescription className="text-base mt-2">
                {event.description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Event Details */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Date & Time</p>
                  <p className="text-sm text-muted-foreground">
                    {formatEventDateRange(event.start_time, event.end_time)}
                  </p>
                </div>
              </div>

              {event.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{event.location}</p>
                  </div>
                </div>
              )}

              {event.max_participants && (
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Capacity</p>
                    <p className="text-sm text-muted-foreground">
                      {event.max_participants} participants max
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Join Button */}
            <Button
              className="w-full"
              size="lg"
              onClick={handleJoinEvent}
              disabled={joining}
            >
              {joining ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Joining...
                </>
              ) : isAuthenticated ? (
                "Join Event"
              ) : (
                "Sign in to Join"
              )}
            </Button>

            {!isAuthenticated && (
              <p className="text-xs text-center text-muted-foreground">
                You'll be redirected to sign in or create an account
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default JoinEvent;
