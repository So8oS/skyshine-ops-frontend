import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { JobForm } from "@/components/job-form";
import {
  useJob,
  useUpdateJob,
  useDeleteJob,
  jobsApi,
  jobKeys,
  type CreateJobRequest,
  type UpdateJobRequest,
} from "@/actions/jobs";
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

export const Route = createFileRoute("/dashboard/jobs/$jobId/edit")({
  component: EditJobPage,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData({
      queryKey: jobKeys.detail(params.jobId),
      queryFn: () => jobsApi.getById(params.jobId),
    });
    return null;
  },
});

function EditJobPage() {
  const { jobId } = Route.useParams();
  const navigate = useNavigate();

  const { data: job, isLoading, error } = useJob(jobId);

  const updateJob = useUpdateJob({ onSuccess: () => navigate({ to: "/dashboard/jobs" }) });
  const deleteJob = useDeleteJob({ onSuccess: () => navigate({ to: "/dashboard/jobs" }) });

  const handleSubmit = (data: CreateJobRequest) => {
    const updateData: UpdateJobRequest = { name: data.name, type: data.type };
    updateJob.mutate({ id: jobId, data: updateData });
  };

  const hasSchedules = (job?.schedules?.length ?? 0) > 0;

  if (error) return <SiteErrorFallback error={error} title="Failed to load job" />;

  return (
    <div className="max-w-2xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" className="hover:text-primary transition-colors" asChild>
          <Link to="/dashboard/jobs"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
            {isLoading ? (
              <>
                <Skeleton className="h-6 w-48 mb-1" />
                <Skeleton className="h-4 w-28" />
              </>
            ) : (
              <>
                <h1 className="text-2xl font-display font-bold">{job?.name}</h1>
                <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">
                  EDIT · JOB · JOB-{jobId.slice(0, 8).toUpperCase()}
                </p>
              </>
            )}
        </div>
      </div>

      {/* Form */}
      {isLoading ? (
        <Card>
          <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : job ? (
        <JobForm
          initialData={job}
          onSubmit={handleSubmit}
          isSubmitting={updateJob.isPending}
          submitLabel="Save Changes"
        />
      ) : null}

      {/* Danger zone */}
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Delete this job</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {hasSchedules
                ? "Cancel or delete all schedules first before deleting this job."
                : "This action is permanent and cannot be undone."}
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                disabled={isLoading || deleteJob.isPending || hasSchedules}
              >
                {deleteJob.isPending
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Trash2 className="h-4 w-4" />}
                DELETE JOB
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Job</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{job?.name}"? This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteJob.mutate(jobId)}
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
