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
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MOTION } from "@/lib/motion";

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
import { useStatisticsOverview } from "@/actions/statistics";
import { StatusDot } from "./status-dot";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const navItems = [
  { title: "Sites",     url: "/dashboard/sites",     icon: Building2 },
  { title: "Jobs",      url: "/dashboard/jobs",      icon: Briefcase },
  { title: "Schedules", url: "/dashboard/schedules", icon: Calendar  },
  { title: "Drones",    url: "/dashboard/drones",    icon: Plane     },
  { title: "Forms",     url: "/dashboard/forms",     icon: FileText  },
];

const SESSION_START = Date.now();

function pad(n: number) { return String(n).padStart(2, "0"); }

function SessionUptime() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const elapsed = Math.floor((Date.now() - SESSION_START) / 1000);
  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  return (
    <div className="flex items-center justify-between px-2 py-1">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">Uptime</span>
      <span className="font-mono text-[10px] tabular-nums text-muted-foreground/80">
        {pad(h)}:{pad(m)}:{pad(s)}
      </span>
    </div>
  );
}

function SystemStatus() {
  const { data: stats } = useStatisticsOverview();
  const available = stats?.dronesByStatus?.AVAILABLE ?? 0;
  const total = stats?.totalDrones ?? 0;
  const isOperational = !stats || available > 0;

  return (
    <div className="px-2 py-2 space-y-1">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
          System
        </span>
        <div className="flex items-center gap-1">
          <StatusDot variant={isOperational ? "live" : "warn"} pulse={isOperational} />
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/80">
            {isOperational ? "Operational" : "Degraded"}
          </span>
        </div>
      </div>
      {stats && (
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
            Drones
          </span>
          <span className="font-mono text-[10px] tracking-wider text-muted-foreground/80">
            {available}/{total} READY
          </span>
        </div>
      )}
    </div>
  );
}

export function AppSidebar() {
  const { data: user } = useUser();
  const logout = useLogout();
  const router = useRouterState();
  const currentPath = router.location.pathname;

  const reducedMotion = useReducedMotion();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 p-1">
                  <img
                    src="/skyshinelogonobgwhite.png"
                    alt="Skyshine"
                    className="size-full object-contain"
                  />
                </div>
                <div className="flex flex-col gap-0 leading-none">
                  <span className="font-semibold text-foreground">Skyshine Ops</span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    OPS · v0.1
                  </span>
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
              {navItems.map((item) => {
                const isActive = currentPath.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-indicator"
                        className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary rounded-r-[2px]"
                        transition={{
                          duration: reducedMotion ? 0.01 : MOTION.duration.base,
                          ease: MOTION.ease.inOut,
                        }}
                      />
                    )}
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
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
        </SidebarMenu>

        <SidebarSeparator />

        {/* System status block */}
        <SystemStatus />
        <SessionUptime />

        <SidebarSeparator />

        {/* User block */}
        <div className="flex items-center justify-between gap-2 px-2 py-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {user?.name ?? "—"}
            </p>
            {user?.role && (
              <p className="truncate font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
                {user.role}
              </p>
            )}
            <p className="truncate font-mono text-[10px] text-muted-foreground/60">
              {user?.email ?? ""}
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                disabled={logout.isPending}
                title="Logout"
                className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sign Out</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to sign out?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => logout.mutate()}>
                  Sign Out
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
