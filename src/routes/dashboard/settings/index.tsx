import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";

export const Route = createFileRoute("/dashboard/settings/")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-slate-500/10">
          <Settings className="h-6 w-6 text-slate-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Configure your preferences</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <p className="text-muted-foreground">Settings content coming soon...</p>
      </div>
    </div>
  );
}
