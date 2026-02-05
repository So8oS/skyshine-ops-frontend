import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, ArrowLeft } from "lucide-react";
import { UASFleetAssetForm } from "@/components/forms/UASFleetAssetForm";
import { UAVRemotePilotCard } from "@/components/forms/UAVRemotePilotCard";
import { StatementOfPurpose } from "@/components/forms/StatementOfPurpose";

export const Route = createFileRoute("/dashboard/forms/$formId")({
  component: FormPage,
});

const formConfig: Record<string, { name: string; description: string; component: React.ComponentType }> = {
  "uas-fleet-asset": {
    name: "UAS/UAV Fleet Asset Management Card",
    description: "Industrial Cleaning & Mapping (Drone Card)",
    component: UASFleetAssetForm,
  },
  "uav-remote-pilot": {
    name: "UAV Remote Pilot Identification Card",
    description: "Pilot qualifications & flight readiness",
    component: UAVRemotePilotCard,
  },
  "statement-of-purpose": {
    name: "Statement of Purpose (SoP)",
    description: "GCAA regulatory submission document",
    component: StatementOfPurpose,
  },
};

function FormPage() {
  const { formId } = Route.useParams();
  const form = formConfig[formId];

  if (!form) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold">Form not found</h1>
          <p className="text-muted-foreground mt-2">The requested form does not exist.</p>
          <Link to="/dashboard/forms" className="text-cyan-500 hover:underline mt-4 inline-block">
            Back to Forms
          </Link>
        </div>
      </div>
    );
  }

  const FormComponent = form.component;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/dashboard/forms" className="p-2 rounded-lg hover:bg-accent transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="p-2 rounded-lg bg-cyan-500/10">
          <FileText className="h-6 w-6 text-cyan-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{form.name}</h1>
          <p className="text-muted-foreground">{form.description}</p>
        </div>
      </div>

      <FormComponent />
    </div>
  );
}
