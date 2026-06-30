import {
  Building2,
  Briefcase,
  Calendar,
  FileText,
  LogOut,
  Plane,
  Settings,
  Palette,
} from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useLogout, useUser } from "@/actions/auth";

const navItems = [
  { title: "Sites",     url: "/dashboard/sites",     icon: Building2 },
  { title: "Jobs",      url: "/dashboard/jobs",      icon: Briefcase },
  { title: "Schedules", url: "/dashboard/schedules", icon: Calendar  },
  { title: "Drones",    url: "/dashboard/drones",    icon: Plane     },
  { title: "Forms",     url: "/dashboard/forms",     icon: FileText  },
];

export function AppSidebar() {
  const { data: user } = useUser();
  const logout = useLogout();
  const router = useRouterState();
  const currentPath = router.location.pathname;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20 p-1">
                  <img
                    src="/skyshinelogonobgwhite.png"
                    alt="Skyshine"
                    className="size-full object-contain"
                  />
                </div>
                <div className="flex flex-col gap-0 leading-none">
                  <span className="font-semibold text-foreground">Skyshine Ops</span>
                  <span className="text-[11px] text-muted-foreground">Operations Center</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={currentPath.startsWith(item.url)}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Design System"
              isActive={currentPath.startsWith("/dashboard/ui")}
            >
              <Link to="/dashboard/ui">
                <Palette className="h-4 w-4" />
                <span>Design System</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <Link to="/dashboard/settings">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
              tooltip="Logout"
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span>{logout.isPending ? "Logging out…" : (user?.name ?? "Logout")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
