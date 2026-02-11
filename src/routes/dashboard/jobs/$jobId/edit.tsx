import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Briefcase, ArrowLeft, Loader2, Trash2 } from "lucide-react";
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

  const updateJob = useUpdateJob({
    onSuccess: () => {
      navigate({ to: "/dashboard/jobs" });
    },
  });

  const deleteJob = useDeleteJob({
    onSuccess: () => {
      navigate({ to: "/dashboard/jobs" });
    },
  });

  const handleSubmit = (data: CreateJobRequest) => {
    const updateData: UpdateJobRequest = { name: data.name, type: data.type };
    updateJob.mutate({ id: jobId, data: updateData });
  };

  const handleDelete = () => {
    deleteJob.mutate(jobId);
  };

  const hasSchedules = (job?.schduales?.length ?? 0) > 0;

  if (error) {
    return <SiteErrorFallback error={error} title="Failed to load job" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/jobs">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Briefcase className="h-6 w-6 text-green-500" />
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
                    Edit {job?.name}
                  </h1>
                  <p className="text-muted-foreground">Update job details</p>
                </>
              )}
            </div>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              disabled={isLoading || deleteJob.isPending || hasSchedules}
            >
              {deleteJob.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete Job
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Job</AlertDialogTitle>
              <AlertDialogDescription>
                {hasSchedules
                  ? "This job has schedules. Cancel or delete schedules first, then you can delete the job."
                  : `Are you sure you want to delete "${job?.name}"? This action cannot be undone.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              {!hasSchedules && (
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="max-w-2xl">
        {isLoading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        ) : job ? (
          <JobForm
            initialData={job}
            onSubmit={handleSubmit}
            isSubmitting={updateJob.isPending}
            submitLabel="Update Job"
          />
        ) : null}
      </div>
    </div>
  );
}
