import { Home, Users, Settings, Shield, Calendar } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Teams", url: "/teams", icon: Users },
  { title: "Events", url: "/events", icon: Calendar },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();
        
        setIsAdmin(!!data);
      }
    };
    
    checkAdminStatus();
  }, []);

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50 bg-background">
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-3 text-sm font-heading font-bold text-primary">
            Athletica Sports
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className="relative transition-all hover:bg-accent/50 data-[active=true]:bg-accent data-[active=true]:text-primary data-[active=true]:font-semibold"
                    >
                      <NavLink to={item.url} end>
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-primary" />
                        )}
                        <item.icon className={cn("transition-colors", isActive && "text-primary")} />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === "/admin"}
                    className="relative transition-all hover:bg-accent/50 data-[active=true]:bg-accent data-[active=true]:text-primary data-[active=true]:font-semibold"
                  >
                    <NavLink to="/admin" end>
                      {location.pathname === "/admin" && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-primary" />
                      )}
                      <Shield className={cn("transition-colors", location.pathname === "/admin" && "text-primary")} />
                      <span>Admin</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
