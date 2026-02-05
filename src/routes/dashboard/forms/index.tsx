import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/dashboard/forms/")({
  component: FormsPage,
});

const forms = [
  {
    id: "uas-fleet-asset",
    name: "UAS/UAV Fleet Asset Management Card",
    description: "Industrial Cleaning & Mapping (Drone Card)",
  },
  {
    id: "uav-remote-pilot",
    name: "UAV Remote Pilot Identification Card",
    description: "Pilot qualifications & flight readiness",
  },
  {
    id: "statement-of-purpose",
    name: "Statement of Purpose (SoP)",
    description: "GCAA regulatory submission document",
  },
];

function FormsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-cyan-500/10">
          <FileText className="h-6 w-6 text-cyan-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Forms</h1>
          <p className="text-muted-foreground">Create and manage forms</p>
        </div>
      </div>

      <div className="grid gap-4">
        {forms.map((form) => (
          <Link key={form.id} to="/dashboard/forms/$formId" params={{ formId: form.id }}>
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10">
                    <FileText className="h-5 w-5 text-cyan-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">{form.name}</h3>
                    <p className="text-sm text-muted-foreground">{form.description}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
