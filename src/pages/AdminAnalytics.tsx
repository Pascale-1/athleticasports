import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Shield, Users, Calendar, TrendingUp, Activity, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";

interface DailyCount {
  date: string;
  count: number;
}

interface FeatureUsage {
  name: string;
  count: number;
}

const chartConfig = {
  count: { label: "Count", color: "hsl(var(--primary))" },
  users: { label: "Users", color: "hsl(var(--primary))" },
  events: { label: "Events", color: "hsl(var(--chart-2, 200 70% 50%))" },
  teams: { label: "Teams", color: "hsl(var(--chart-3, 150 60% 45%))" },
} satisfies ChartConfig;

const PIE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2, 200 70% 50%))",
  "hsl(var(--chart-3, 150 60% 45%))",
  "hsl(var(--chart-4, 40 80% 55%))",
  "hsl(var(--chart-5, 280 60% 55%))",
];

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);
  const [totalTeams, setTotalTeams] = useState(0);
  const [activeUsersToday, setActiveUsersToday] = useState(0);
  const [userGrowth, setUserGrowth] = useState<DailyCount[]>([]);
  const [eventGrowth, setEventGrowth] = useState<DailyCount[]>([]);
  const [featureUsage, setFeatureUsage] = useState<FeatureUsage[]>([]);
  const [topPages, setTopPages] = useState<FeatureUsage[]>([]);

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  const checkAdminAndFetch = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }

      const { data: isUserAdmin } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      if (!isUserAdmin) { toast.error("Admin access required"); navigate("/"); return; }

      setIsAdmin(true);
      await fetchAllData();
    } catch {
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    const days30 = subDays(new Date(), 30);
    const todayStart = startOfDay(new Date()).toISOString();
    const days30Str = days30.toISOString();

    // Fetch counts and growth data in parallel
    const [profilesRes, eventsRes, teamsRes, analyticsRes] = await Promise.all([
      supabase.from("profiles_public" as any).select("created_at", { count: "exact" }),
      supabase.from("events").select("created_at", { count: "exact" }),
      supabase.from("teams").select("created_at", { count: "exact" }),
      supabase.from("analytics_events" as any).select("*").gte("created_at", days30Str),
    ]);

    setTotalUsers(profilesRes.count ?? 0);
    setTotalEvents(eventsRes.count ?? 0);
    setTotalTeams(teamsRes.count ?? 0);

    // User growth (last 30 days)
    const dateRange = eachDayOfInterval({ start: days30, end: new Date() });
    const usersByDay = new Map<string, number>();
    dateRange.forEach(d => usersByDay.set(format(d, "MMM dd"), 0));

    (profilesRes.data ?? []).forEach((p: any) => {
      const day = format(new Date(p.created_at), "MMM dd");
      if (usersByDay.has(day)) usersByDay.set(day, (usersByDay.get(day) ?? 0) + 1);
    });
    setUserGrowth(Array.from(usersByDay.entries()).map(([date, count]) => ({ date, count })));

    // Event growth
    const eventsByDay = new Map<string, number>();
    dateRange.forEach(d => eventsByDay.set(format(d, "MMM dd"), 0));
    (eventsRes.data ?? []).forEach((e: any) => {
      const day = format(new Date(e.created_at), "MMM dd");
      if (eventsByDay.has(day)) eventsByDay.set(day, (eventsByDay.get(day) ?? 0) + 1);
    });
    setEventGrowth(Array.from(eventsByDay.entries()).map(([date, count]) => ({ date, count })));

    // Analytics events processing
    const analyticsData = (analyticsRes.data ?? []) as any[];

    // Active users today
    const todayUsers = new Set(
      analyticsData.filter((e: any) => e.created_at >= todayStart).map((e: any) => e.user_id)
    );
    setActiveUsersToday(todayUsers.size);

    // Feature usage (by event category)
    const categoryMap = new Map<string, number>();
    analyticsData.forEach((e: any) => {
      if (e.event_name !== "page_view") {
        const cat = e.event_category || "general";
        categoryMap.set(cat, (categoryMap.get(cat) ?? 0) + 1);
      }
    });
    setFeatureUsage(
      Array.from(categoryMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8)
    );

    // Top pages
    const pageMap = new Map<string, number>();
    analyticsData
      .filter((e: any) => e.event_name === "page_view")
      .forEach((e: any) => {
        const page = e.metadata?.path || e.page_url || "unknown";
        pageMap.set(page, (pageMap.get(page) ?? 0) + 1);
      });
    setTopPages(
      Array.from(pageMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    );
  };

  if (!isAdmin || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Track app performance and user engagement</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5 text-xs">
              <Users className="h-3.5 w-3.5" /> Total Users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl sm:text-3xl font-bold">{totalUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5 text-xs">
              <Activity className="h-3.5 w-3.5" /> Active Today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl sm:text-3xl font-bold">{activeUsersToday}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5 text-xs">
              <Calendar className="h-3.5 w-3.5" /> Total Events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl sm:text-3xl font-bold">{totalEvents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5 text-xs">
              <Shield className="h-3.5 w-3.5" /> Total Teams
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl sm:text-3xl font-bold">{totalTeams}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="growth" className="space-y-4">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="growth" className="text-xs sm:text-sm">User Growth</TabsTrigger>
          <TabsTrigger value="events" className="text-xs sm:text-sm">Events</TabsTrigger>
          <TabsTrigger value="engagement" className="text-xs sm:text-sm">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="growth">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> New Users (30 days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full">
                <AreaChart data={userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    fill="hsl(var(--primary) / 0.2)"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Events Created (30 days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full">
                <BarChart data={eventGrowth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement">
          <div className="grid md:grid-cols-2 gap-4">
            {featureUsage.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Feature Usage</CardTitle>
                  <CardDescription>Actions by category (30 days)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Pie
                        data={featureUsage}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name }) => name}
                      >
                        {featureUsage.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Top Pages</CardTitle>
                <CardDescription>Most visited pages (30 days)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topPages.length === 0 && (
                    <p className="text-sm text-muted-foreground">No page view data yet. Analytics will appear as users interact with the app.</p>
                  )}
                  {topPages.map((page, i) => (
                    <div key={page.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-medium text-muted-foreground w-5">{i + 1}.</span>
                        <span className="text-sm truncate">{page.name}</span>
                      </div>
                      <span className="text-sm font-medium tabular-nums">{page.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalytics;
