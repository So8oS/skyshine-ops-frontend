import { createFileRoute, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { authKeys, authApi } from "@/actions/auth";
import { OpsClock } from "@/components/ops-clock";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData({
      queryKey: authKeys.user(),
      queryFn: authApi.getMe,
    });

    if (!user) {
      throw redirect({ to: "/auth" });
    }
  },
  component: DashboardLayout,
});

function Breadcrumb() {
  const router = useRouterState();
  const pathname = router.location.pathname;

  const segments = pathname
    .split("/")
    .filter(Boolean)
    .map((seg) => seg.toLowerCase().replace(/_/g, "-"));

  if (segments.length === 0) return null;

  return (
    <nav className="font-mono text-[11px] text-muted-foreground/70 hidden sm:flex items-center gap-1">
      {segments.map((seg, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span className="text-muted-foreground/30">/</span>}
          <span className={i === segments.length - 1 ? "text-foreground/60" : ""}>
            {seg}
          </span>
        </span>
      ))}
    </nav>
  );
}

function DashboardLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center gap-3 border-b border-border bg-background/80 backdrop-blur-md px-4 sticky top-0 z-10">
          <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
          <div className="h-4 w-px bg-border" />
          <Breadcrumb />
          <div className="flex-1" />
          {/* Global search placeholder — command palette hook for later */}
          <button
            className="hidden md:flex items-center gap-2 rounded-[6px] border border-border bg-muted/30 px-3 h-7 text-muted-foreground/60 hover:text-muted-foreground hover:border-border-strong transition-colors"
            title="Search (coming soon)"
            disabled
          >
            <span className="font-mono text-[11px]">Search</span>
            <span className="font-mono text-[10px] border border-border/60 rounded-[3px] px-1 py-0.5 leading-none">
              ⌘K
            </span>
          </button>
          <OpsClock />
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
