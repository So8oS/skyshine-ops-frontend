import { createFileRoute } from "@tanstack/react-router";
import { Briefcase } from "lucide-react";

export const Route = createFileRoute("/dashboard/jobs/")({
  component: JobsPage,
});

function JobsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-green-500/10">
          <Briefcase className="h-6 w-6 text-green-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Jobs</h1>
          <p className="text-muted-foreground">Track and manage your jobs</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <p className="text-muted-foreground">Jobs content coming soon...</p>
      </div>
    </div>
  );
}
