import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/settings/")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Configure your preferences</p>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <p className="text-muted-foreground">Settings content coming soon...</p>
      </div>
    </div>
  );
}
