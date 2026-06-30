import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { authKeys, authApi } from "@/actions/auth";

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

function DashboardLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 items-center gap-3 border-b border-border/50 bg-card/50 backdrop-blur-sm px-5 sticky top-0 z-10">
          <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
          <div className="h-4 w-px bg-border" />
          <div className="flex-1" />
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
