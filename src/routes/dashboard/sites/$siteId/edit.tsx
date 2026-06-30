import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
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
  const updateSite = useUpdateSite({ onSuccess: () => navigate({ to: "/dashboard/sites" }) });
  const deleteSite = useDeleteSite({ onSuccess: () => navigate({ to: "/dashboard/sites" }) });

  if (error) return <SiteErrorFallback error={error} title="Failed to load site" />;

  return (
    <div className="max-w-2xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link to="/dashboard/sites"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
            {isLoading ? (
              <>
                <Skeleton className="h-6 w-48 mb-1" />
                <Skeleton className="h-4 w-28" />
              </>
            ) : (
              <>
                <h1 className="text-xl font-bold tracking-tight">{site?.name}</h1>
                <p className="text-sm text-muted-foreground">Edit site information</p>
              </>
            )}
        </div>
      </div>

      {/* Form */}
      {isLoading ? (
        <Card>
          <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : site ? (
        <SiteForm
          initialData={site}
          onSubmit={(data: CreateSiteRequest) => updateSite.mutate({ id: siteId, data })}
          isSubmitting={updateSite.isPending}
          submitLabel="Save Changes"
        />
      ) : null}

      {/* Danger zone */}
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Delete this site</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Permanently removes the site and may affect associated jobs and schedules.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                disabled={isLoading || deleteSite.isPending}
              >
                {deleteSite.isPending
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Trash2 className="h-4 w-4" />}
                Delete Site
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Site</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{site?.name}"? This cannot be undone.
                  All associated jobs and schedules may also be affected.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteSite.mutate(siteId)}
                  className="bg-destructive text-white hover:bg-destructive/85"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
