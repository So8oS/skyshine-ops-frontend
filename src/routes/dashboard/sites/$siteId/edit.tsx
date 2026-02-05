import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Building2, ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { SiteForm } from "@/components/site-form";
import {
  useSite,
  useUpdateSite,
  useDeleteSite,
  sitesApi,
  siteKeys,
  type CreateSiteRequest,
} from "@/actions/sites";
import { SiteErrorFallback } from "@/components/site-error-fallback";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/dashboard/sites/$siteId/edit")({
  component: EditSitePage,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData({
      queryKey: siteKeys.detail(params.siteId),
      queryFn: () => sitesApi.getById(params.siteId),
    });
    return null;
  },
});

function EditSitePage() {
  const { siteId } = Route.useParams();
  const navigate = useNavigate();

  const { data: site, isLoading, error } = useSite(siteId);

  const updateSite = useUpdateSite({
    onSuccess: () => {
      navigate({ to: "/dashboard/sites" });
    },
  });

  const deleteSite = useDeleteSite({
    onSuccess: () => {
      navigate({ to: "/dashboard/sites" });
    },
  });

  const handleSubmit = (data: CreateSiteRequest) => {
    updateSite.mutate({ id: siteId, data });
  };

  const handleDelete = () => {
    deleteSite.mutate(siteId);
  };

  if (error) {
    return <SiteErrorFallback error={error} title="Failed to load site" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-48 mb-1" />
                  <Skeleton className="h-4 w-32" />
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-bold tracking-tight">
                    Edit {site?.name}
                  </h1>
                  <p className="text-muted-foreground">
                    Update site information
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Delete Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              disabled={isLoading || deleteSite.isPending}
            >
              {deleteSite.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete Site
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Site</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{site?.name}"? This action
                cannot be undone. All associated jobs and schedules may also be
                affected.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        {isLoading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        ) : site ? (
          <SiteForm
            initialData={site}
            onSubmit={handleSubmit}
            isSubmitting={updateSite.isPending}
            submitLabel="Update Site"
          />
        ) : null}
      </div>
    </div>
  );
}
