import { createFileRoute } from "@tanstack/react-router";
import { Building2, Briefcase, Calendar, Plane } from "lucide-react";
import { useUser } from "@/actions/auth";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardIndex,
});

function DashboardIndex() {
  const { data: user } = useUser();

  const stats = [
    { title: "Total Sites", value: "12", icon: Building2, color: "bg-blue-500" },
    { title: "Active Jobs", value: "8", icon: Briefcase, color: "bg-green-500" },
    { title: "Scheduled", value: "24", icon: Calendar, color: "bg-purple-500" },
    { title: "Drones", value: "6", icon: Plane, color: "bg-orange-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back{user?.name ? `, ${user.name}` : ""}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's an overview of your operations.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="rounded-xl border bg-card p-6 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className={`rounded-lg ${stat.color} p-3`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-muted-foreground">Job completed at Site A</span>
              <span className="ml-auto text-xs text-muted-foreground">2h ago</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-muted-foreground">New schedule created</span>
              <span className="ml-auto text-xs text-muted-foreground">4h ago</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="h-2 w-2 rounded-full bg-orange-500" />
              <span className="text-muted-foreground">Drone maintenance required</span>
              <span className="ml-auto text-xs text-muted-foreground">1d ago</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="rounded-lg border p-3 text-sm font-medium hover:bg-accent transition-colors">
              + New Job
            </button>
            <button className="rounded-lg border p-3 text-sm font-medium hover:bg-accent transition-colors">
              + New Site
            </button>
            <button className="rounded-lg border p-3 text-sm font-medium hover:bg-accent transition-colors">
              + Schedule
            </button>
            <button className="rounded-lg border p-3 text-sm font-medium hover:bg-accent transition-colors">
              View Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
