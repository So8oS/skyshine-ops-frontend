import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Building2, ArrowLeft } from "lucide-react";
import { SiteForm } from "@/components/site-form";
import { useCreateSite, type CreateSiteRequest } from "@/actions/sites";

export const Route = createFileRoute("/dashboard/sites/new")({
  component: NewSitePage,
});

function NewSitePage() {
  const navigate = useNavigate();
  const createSite = useCreateSite({
    onSuccess: () => {
      navigate({ to: "/dashboard/sites" });
    },
  });

  const handleSubmit = (data: CreateSiteRequest) => {
    createSite.mutate(data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/dashboard/sites">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Building2 className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Add New Site</h1>
            <p className="text-muted-foreground">
              Create a new operation site
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <SiteForm
          onSubmit={handleSubmit}
          isSubmitting={createSite.isPending}
          submitLabel="Create Site"
        />
      </div>
    </div>
  );
}
