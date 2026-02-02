import { createFileRoute } from "@tanstack/react-router";
import { Plane } from "lucide-react";

export const Route = createFileRoute("/dashboard/drones/")({
  component: DronesPage,
});

function DronesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-orange-500/10">
          <Plane className="h-6 w-6 text-orange-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Drones</h1>
          <p className="text-muted-foreground">Manage your drone fleet</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <p className="text-muted-foreground">Drones content coming soon...</p>
      </div>
    </div>
  );
}
